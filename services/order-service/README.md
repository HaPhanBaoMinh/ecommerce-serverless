# ecommerce-serverless

## Test DynamoDB Local

Create table:
```bash
aws dynamodb create-table --cli-input-json file://product.json --endpoint-url http://localhost:8000
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
aws dynamodb batch-write-item --request-items file://data.json --endpoint-url http://localhost:8000
```

## Deploy

```bash
sam build && sam deploy --capabilities CAPABILITY_NAMED_IAM
```



