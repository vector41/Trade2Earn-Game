import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

export class DynamoDBConnection {
    public static client = new DynamoDBClient({
        region: 'local',
        endpoint: 'http://localhost:8000',
    })
}
