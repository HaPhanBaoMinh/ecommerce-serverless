# ecommerce-serverless

## Architecture
![Architecture](/images/ecommerce-serverless.drawio.png)

## Description
This project is a serverless application that simulates an e-commerce platform. It is composed of the following services, I build them using AWS Lambda, API Gateway, DynamoDB, and S3 for hand on experience with serverless technologies.

- **Product Service**: responsible for managing products.
- **Order Service**: responsible for managing orders.
- **Payment Service**: responsible for processing payments.
- **Frontend**: a React application that consumes the services.
- **Authentication Service**: responsible for managing users.

## Technologies

- **AWS Lambda**: to run the code.
- **API Gateway**: to expose the services.
- **DynamoDB**: to store the data.
- **S3**: to store the static files.
- **SAM**: to deploy the services.
- **React**: to build the frontend.
- **Stripe**: to process payments.
- **Cognito**: to manage users.

## How to run

### Prerequisites
- AWS CLI
- SAM CLI
- Node.js
- React
- Stripe account
- Docker
- Python

### Steps
1. Clone the repository
2. Deploy the services
3. Deploy the frontend
4. Create a Stripe account
5. Update the frontend with your Stripe public key
6. Test the application
7. Cleanup

