import boto3
import os
import json
from botocore.exceptions import ClientError
import uuid
from datetime import datetime
import stripe

# Get Stripe API Key
stripe.api_key = os.environ['STRIPE_SECRET_KEY']

def lambda_handler(event, context):
    # Connect to DynamoDB
    dynamodb = connect_to_dynamodb()
    table_name = os.environ['TABLE_NAME']
    table = dynamodb.Table(table_name)
    record = event['Records']

    try:
        for r in record:
            body = json.loads(r['body'])
            body['status'] = 'pending'
            body['order_date'] = datetime.now().isoformat()
            table.put_item(Item=body)
            order_id = body['order_id']

            # Check price and quantity
            items = body.get('items', [])
            total_price = 0
            amount = 0

            for item in items:
                product_id = item.get('product_id')
                quantity = item.get('quantity')

                print(f"Checking product ID: {product_id} and quantity: {quantity}")

                if not product_id or quantity is None:
                    print("Invalid input: 'product_id' and 'quantity' are required for all items.")
                    return {
                        "statusCode": 400,
                        "body": json.dumps({"message": "Invalid input: 'product_id' and 'quantity' are required for all items."})
                    }

                product_table = dynamodb.Table(os.environ['PRODUCT_TABLE_NAME'])
                product = product_table.get_item(Key={'product_id': product_id}).get('Item')

                print(f"Product: {product}")

                if not product:
                    print(f"Product with ID '{product_id}' not found.")
                    return {
                        "statusCode": 404,
                        "body": json.dumps({"message": f"Product with ID '{product_id}' not found."})
                    }

                if product.get('quantity', 0) < quantity:
                    print(f"Not enough stock for product ID '{product_id}'. Requested: {quantity}, Available: {product.get('quantity', 0)}")
                    body['status'] = 'failed'
                    body['message'] = f"Not enough stock for product ID '{product_id}'. Requested: {quantity}, Available: {product.get('quantity', 0)}"
                    table.put_item(Item=body)
                    return {
                        "statusCode": 400,
                        "body": json.dumps({"message": f"Not enough stock for product ID '{product_id}'. Requested: {quantity}, Available: {product.get('quantity', 0)}"})
                    }

                # Calculate total price
                total_price += product['price'] * quantity
                amount += quantity

                # Update stock
                product_table.update_item(
                    Key={'product_id': product_id},
                    UpdateExpression="SET quantity = quantity - :quantity",
                    ExpressionAttributeValues={':quantity': quantity}
                )

            body['total_price'] = total_price
            body['amount'] = amount
            table.put_item(Item=body)
            description = f"Order {order_id} - {amount} items"
            metadata = {
                "order_id": order_id,
                "user_id": body.get("user_id")
            }

            # Create Payment Intent
            payment_intent = create_payment_intent(total_price, "usd", description, metadata)
            body['payment_intent_id'] = payment_intent.get("id")
            body['client_secret'] = payment_intent.get("client_secret")
            table.put_item(Item=body)

            print("Order placed successfully")

            return {
                "statusCode": 201,
                "body": json.dumps({
                    "message": "Order placed successfully",
                    "order_id": order_id,
                    "client_secret": payment_intent.get("client_secret"),
                    "payment_intent_id": payment_intent.get("id")
                })
            }

    except Exception as e:
        print("Error occurred:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({
                "message": "Internal Server Error",
                "error": str(e)
            })
        }

def connect_to_dynamodb():
    if os.environ['IS_LOCAL'] == 'true':
        dynamodb = boto3.resource('dynamodb', endpoint_url=os.environ['DYNAMODB_ENDPOINT'])
    else:
        dynamodb = boto3.resource('dynamodb')
    return dynamodb

def create_payment_intent(amount, currency, description, metadata):
    """
    Tạo Payment Intent với Stripe
    """
    try:
        # Stripe requires the amount to be in cents
        payment_intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Convert to cents
            currency=currency,
            description=description,
            metadata=metadata,
        )
        print("Payment Intent created:", payment_intent)
        return payment_intent
    except Exception as e:
        print("Stripe error occurred:", str(e))
        raise e
