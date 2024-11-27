import boto3
import os
import json
from botocore.exceptions import ClientError
import uuid
from datetime import datetime
import stripe

def lambda_handler(event, context):
    # Connect to DynamoDB
    dynamodb = connect_to_dynamodb()
    table_name = os.environ['TABLE_NAME']
    table = dynamodb.Table(table_name)
    stripe_api_key = os.environ['STRIPE_SECRET_KEY']
    stripe_endpoint_secret = os.environ['STRIPE_ENDPOINT_SECRET']
    sig_header = event['headers']['Stripe-Signature']
    stripe_event = None

    body_format = json.loads(event['body'])
    order_id = body_format['data']['object']['metadata']['order_id']

    try:
        stripe_event = stripe.Webhook.construct_event(
            payload = event['body'],
            sig_header = sig_header,
            secret = stripe_endpoint_secret
        )

        if stripe_event.type == 'charge.succeeded':
            payment_intent = stripe_event.data.object
            order_id = payment_intent.metadata.get('order_id', None)
            user_id = payment_intent.metadata.get('user_id', None)
            if not order_id:
                raise ValueError("Order ID not found in payment metadata")

            print(f"Updating order {order_id} in DynamoDB...")

            # Fetch the order from DynamoDB
            response = table.get_item(Key={'user_id': user_id, 'order_id': order_id})
            if 'Item' not in response:
                raise ValueError(f"Order {order_id} not found in DynamoDB")

            # Update order status to 'completed'
            table.update_item(
                Key={'user_id': user_id, 'order_id': order_id},
                UpdateExpression="SET #status = :status, #updated_at = :updated_at",
                ExpressionAttributeNames={
                    '#status': 'status',
                    '#updated_at': 'updated_at'
                },
                ExpressionAttributeValues={
                    ':status': 'succeeded',
                    ':updated_at': datetime.now().isoformat()
                }
            )

            print(f"Order {order_id} updated successfully.")
        
        else:
            print(f"Unhandled event type: {stripe_event.type}")


    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        print('Error verifying webhook signature: {}'.format(str(e)))
        return {
            "statusCode": 400,
            "body": json.dumps({
                "message": "Invalid signature"
            })
        }
        
    except Exception as e:
        print('Error parsing payload: {}'.format(str(e)))
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