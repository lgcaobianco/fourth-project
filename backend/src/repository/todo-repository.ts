import * as AWS from "aws-sdk";
import {
    TodoItem
} from "../models/TodoItem";
import {
    UpdateTodoRequest
} from "../requests/UpdateTodoRequest";
import * as uuid from "uuid";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";



const table = 'Todos';
const tableIndex = '';
const documentClient = new AWS.DynamoDB.DocumentClient();

export function findAllByEmail(email: String){
    return documentClient.query({
            TableName: table,
            IndexName: tableIndex,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": email
            }
        })
        .promise();
}

export function save(todoRequest: CreateTodoRequest, email: string){
    const todo = {...todoRequest} as TodoItem;
    todo.todoId = uuid.v4();
    todo.userId = email;
    todo.createdAt = new Date().toISOString();

    return this.docClient
        .put({
            TableName: this.todoTable,
            Item: todo,
        })
        .promise();
}

export function update(id: String, todoUpdated: UpdateTodoRequest, email: String) {
    return documentClient.update({
        TableName: this.todoTable,
        Key: {
            id,
            email,
        },
        UpdateExpression: "set #name = :n, #dueDate = :due, #done = :d",
        ExpressionAttributeValues: {
            ":n": todoUpdated.name,
            ":due": todoUpdated.dueDate,
            ":d": todoUpdated.done,
        },
        ExpressionAttributeNames: {
            "#name": "name",
            "#dueDate": "dueDate",
            "#done": "done",
        },
    }).promise();
}

export function deleteOne(id: String, email: String) {
    return this.documentClient.delete(
        {
          TableName: this.todoTable,
          Key: {
            id,
            email,
          },
        }
      );
}

export async function getPresignedImageUrl(
    todoId: String,
    imageId: String,
    userId: String
  ): Promise<string> {
    const attachmentUrl = await this.s3.getSignedUrl("putObject", {
      Bucket: this.bucketName,
      Key: imageId,
      Expires: this.urlExpiration,
    });

    this.docClient.update(
      {
        TableName: this.todoTable,
        Key: {
          todoId,
          userId,
        },
        UpdateExpression: "set attachmentUrl = :attachmentUrl",
        ExpressionAttributeValues: {
          ":attachmentUrl": `https://${this.bucketName}.s3.amazonaws.com/${imageId}`,
        },
      },
      function (err, data) {
        if (err) {
          console.log("ERRROR " + err);
          throw new Error("Error " + err);
        } else {
          console.log("Element updated " + data);
        }
      }
    );
    return attachmentUrl;
  }

