import boto3
import os
import json
from botocore.exceptions import ClientError
import uuid
from datetime import datetime

# import requests

def lambda_handler(event, context):
    # Connect to DynamoDB
    dynamodb = connect_to_dynamodb()
    table_name = os.environ['TABLE_NAME']
    table = dynamodb.Table(table_name)
    
    # Get the HTTP method, order_id and body from the event
    http_method = event['httpMethod']
    path_parameters = event.get('pathParameters', {})
    body = json.loads(event['body']) if event.get('body') else {}
    user_id = event.get('requestContext', {}).get('authorizer', {}).get('claims', {}).get('sub')

    try:
        if http_method == 'GET':
            return get_orders(table, user_id)

    except Exception as e:
        print("Error occurred:", str(e))
        return response(500, {"error": "Internal Server Error"})

def connect_to_dynamodb():
    if os.environ['IS_LOCAL'] == 'true':
        dynamodb = boto3.resource('dynamodb', endpoint_url=os.environ['DYNAMODB_ENDPOINT'])
    else:
        dynamodb = boto3.resource('dynamodb')
    return dynamodb

def get_orders(table, user_id):
    result = table.query(
        IndexName='user_id-index',
        KeyConditionExpression='user_id = :user_id',
        ExpressionAttributeValues={
            ':user_id': user_id
        }
    )
    
    result = decimal_to_float(result)
    items = result.get('Items', [])
    if items:
        return response(200, items)
    else:
        return response(404, {"message": "No orders found"})

def response(status_code, body):
    return {
        "statusCode": status_code,
        "body": json.dumps(body),
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        }
    }

def decimal_to_float(obj):
    from decimal import Decimal
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, dict):
        return {key: decimal_to_float(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [decimal_to_float(item) for item in obj]
    return obj