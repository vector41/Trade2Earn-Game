"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBConnection = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
class DynamoDBConnection {
}
exports.DynamoDBConnection = DynamoDBConnection;
DynamoDBConnection.client = new client_dynamodb_1.DynamoDBClient({
    region: 'local',
    endpoint: 'http://localhost:8000',
});
