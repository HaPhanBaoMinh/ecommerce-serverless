# ecommerce-serverless

## Test DynamoDB Local

Create table:
```bash
aws dynamodb create-table --cli-input-json file://cart.json --endpoint-url http://localhost:8000
```

```bash
aws dynamodb create-table --cli-input-json file://cart_item.json --endpoint-url http://localhost:8000
```

List tables:
```bash
  aws dynamodb list-tables --endpoint-url http://localhost:8000
```

Delete table:
```bash
aws dynamodb delete-table --table-name Product --endpoint-url http://localhost:8000
```

Scan table:
```bash
aws dynamodb scan --table-name Product --endpoint-url http://localhost:8000
```

## Test Lambda Function Locally
To invoke a lambda function locally, you can use the following command:
```bash
sam build && sam local invoke --docker-network dynamodb-local-network
```
To start the API Gateway locally, you can use the following command:
```bash
sam build && sam local start-api --docker-network dynamodb-local-network --port 9000
```

## Init data

```bash
aws dynamodb batch-write-item --request-items file://cart_data.json --endpoint-url http://localhost:8000
```

```bash
aws dynamodb batch-write-item --request-items file://cart_item_data.json --endpoint-url http://localhost:8000
```