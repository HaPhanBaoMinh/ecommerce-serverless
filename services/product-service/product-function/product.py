import boto3
import os
import json
from botocore.exceptions import ClientError
import uuid

def lambda_handler(event, context):
    # Connect to DynamoDB
    dynamodb = connect_to_dynamodb()
    table_name = os.environ['TABLE_NAME']
    table = dynamodb.Table(table_name)

    # Get the HTTP method, product_id and body from the event
    http_method = event['httpMethod']
    path_parameters = event.get('pathParameters', {})
    product_id = path_parameters.get('product_id') if path_parameters else None
    body = json.loads(event['body']) if event.get('body') else {}

    # Handle the HTTP method
    try:
        if http_method == 'POST':
            return create_product(body, table)
        elif http_method == 'GET' and product_id:
            return get_product(product_id, table)
        elif http_method == 'GET':  # Get all products
            return get_all_products(table)
        elif http_method == 'PUT' and product_id:
            return update_product(product_id, body, table)
        elif http_method == 'DELETE' and product_id:
            return delete_product(product_id, table)
        else:
            return response(400, {"message": "Invalid request"})
    except ClientError as e:
        return response(500, {"error": e.response['Error']['Message']})


def get_product(product_id, table):
    result = table.get_item(Key={'product_id': product_id})
    result = decimal_to_float(result)
    if 'Item' in result:
        return response(200, result['Item'])
    else:
        return response(404, {"message": "Product not found"})

def create_product(body, table):
    product_id = product_id = body.get('product_id') or str(uuid.uuid4())
    if not product_id:
        return response(400, {"message": "Product ID is required"})

    # Insert the new product
    table.put_item(Item=body)
    return response(201, {"message": "Product created", "product_id": product_id})

def get_all_products(table):
    result = table.scan(
        ProjectionExpression="product_id, product_name, price, image_url"
    )  # Scan retrieves all items in the table
    result = decimal_to_float(result)
    items = result.get('Items', [])
    if items:
        return response(200, items)
    else:
        return response(404, {"message": "No products found"})

def update_product(product_id, body, table):
    update_expression = "SET " + ", ".join([f"{k}=:{k}" for k in body.keys()])
    expression_values = {f":{k}": v for k, v in body.items()}
    
    table.update_item(
        Key={'product_id': product_id},
        UpdateExpression=update_expression,
        ExpressionAttributeValues=expression_values,
    )
    return response(200, {"message": "Product updated"})

def delete_product(product_id, table):
    table.delete_item(Key={'product_id': product_id})
    return response(200, {"message": "Product deleted"})

def response(status_code, body):
    return {
        "statusCode": status_code,
        "body": json.dumps(body),
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        }
    }

def connect_to_dynamodb():
    if os.environ['IS_LOCAL'] == 'true':
        dynamodb = boto3.resource('dynamodb', endpoint_url=os.environ['DYNAMODB_ENDPOINT'])
    else:
        dynamodb = boto3.resource('dynamodb')
    return dynamodb

def decimal_to_float(obj):
    from decimal import Decimal
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, dict):
        return {key: decimal_to_float(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [decimal_to_float(item) for item in obj]
    return obj