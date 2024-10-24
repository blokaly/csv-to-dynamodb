import {DynamoDBDocumentClient, GetCommand, PutCommand} from '@aws-sdk/lib-dynamodb';
import {fromEnv} from '@aws-sdk/credential-providers';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import * as dotenv from 'dotenv';
import {createHash} from "node:crypto";

dotenv.config();

const DynamoDB_Client = new DynamoDBClient({
    endpoint: process.env.DYNAMODB_URL,
    region: process.env.AWS_REGION,
    credentials: fromEnv(),
});

const DynamoDoc_Client = DynamoDBDocumentClient.from(DynamoDB_Client);

const TABLE_NAME = 'app';

const shake256 = (data: string, length: number) => {
    return createHash("shake256", {outputLength: length})
        .update(data)
        .digest("hex");
}

const stringToNumberOrNull = (val: string) => {
    if (val && val.length > 0) {
      const num = parseInt(val, 10)
      return isNaN(num) ? null : num
    }
    return null;
}

export const WriteRecord = async (record: Record<string, string>) => {
    const id = shake256(record.Title, 6)
    const item = {
        PK: id,
        SK: id,
        Title: record.Title,
        MediaType: record.Type,
        GSI1PK: 'AsOf',
        GSI1SK: record['As of'],
        NetflixRank: stringToNumberOrNull(record.Rank),
        YearToDateRanK: stringToNumberOrNull(record['Year to Date Rank']),
        LastWeekRank: stringToNumberOrNull(record['Last Week Rank']),
        NetflixExclusive: record['Netflix Exclusive'] === 'Yes',
        NetflixReleaseDate: record['Netflix Release Date'],
        DaysInTop10: stringToNumberOrNull(record['Days In Top 10']),
        ViewershipScore: stringToNumberOrNull(record['Viewership Score'])
    };

    const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
    });

    try {
        const result = await DynamoDoc_Client.send(command);
        if (result.$metadata.httpStatusCode === 200) {
            return true;
        }
    } catch (error) {
        console.error('dynamodb write record error', error);
    }
    return false;
};

export const ReadRecord = async (title: string) => {
    const id = shake256(title, 6)
    const params = {
        TableName: TABLE_NAME,
        Key: {
            PK: id,
            SK: id,
        },
        ProjectionExpression: 'NetflixRank,NetflixReleaseDate,DaysInTop10,ViewershipScore',
    };

    try {
        const result = await DynamoDoc_Client.send(new GetCommand(params));
        if (result && result.Item) {
            return result.Item;
        }
    } catch (error) {
        console.error('dynamodb read record error', error);
    }
    return null;
};
