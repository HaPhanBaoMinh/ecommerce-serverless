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

    http_method = event['httpMethod']
    path_parameters = event.get('pathParameters', {})
    body = json.loads(event['body']) if event.get('body') else {}
    user_id = event.get('requestContext', {}).get('authorizer', {}).get('claims', {}).get('sub')
    # Handle the HTTP method

    print(event)

    try:
        if http_method == 'GET':
            return get_cart(table, user_id)
        elif http_method == 'POST':
            return update_cart(body, table, user_id)
        else:
            return response(400, {"message": "Inval request"})    
    except ClientError as e:
        return response(500, {"error": e.response['Error']['Message']})


def get_cart(table, user_id):
    result = table.get_item(Key={'user_id': user_id})
    # Create new cart if it doesn't exist
    if 'Item' not in result:
        table.put_item(Item={'user_id': user_id, 'items': []})
        result = table.get_item(Key={'user_id': user_id})

    result = decimal_to_float(result)
    if 'Item' in result:
        return response(200, result['Item'])
    else:
        return response(404, {"message": "cart not found"})

def update_cart(body, table, user_id):
    update_expression = "SET " + ", ".join([f"{k}=:{k}" for k in body.keys()])
    expression_values = {f":{k}": v for k, v in body.items()}
    
    table.update_item(
        Key={'user_id': user_id},
        UpdateExpression=update_expression,
        ExpressionAttributeValues=expression_values,
    )
    return response(200, {"message": "cart updated"})

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