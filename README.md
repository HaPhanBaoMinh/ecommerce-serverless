# ecommerce-serverless

## Test DynamoDB Local
```bash
aws dynamodb create-table --cli-input-json file://table.json --endpoint-url http://localhost:8000
```

```bash
aws dynamodb list-tables --endpoint-url http://localhost:8000
```

To invoke a lambda function locally, you can use the following command:
```bash
sam build && sam local invoke --docker-network dynamodb-local-network
```
To start the API Gateway locally, you can use the following command:
```bash
sam build && sam local start-api --docker-network dynamodb-local-network
```
