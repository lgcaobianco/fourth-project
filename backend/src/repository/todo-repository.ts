import * as AWS from "aws-sdk";
import {
  TodoItem
} from "../models/TodoItem";
import {
  UpdateTodoRequest
} from "../requests/UpdateTodoRequest";
import * as uuid from "uuid";
import {
  CreateTodoRequest
} from "../requests/CreateTodoRequest";



export function findAllByUserId(userId: String) {
  const documentClient = new AWS.DynamoDB.DocumentClient();
  return documentClient.query({
      TableName: 'Todo-dev',
      IndexName: 'TodoUserIndex',
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      }
    })
    .promise();
}

export async function save(todoRequest: CreateTodoRequest, userId: string) {
  const documentClient = new AWS.DynamoDB.DocumentClient();
  const todo = { ...todoRequest } as TodoItem;
  todo.todoId = uuid.v4();
  todo.userId = userId;
  todo.createdAt = new Date().toISOString();
  await documentClient
    .put({
      TableName: 'Todo-dev',
      Item: todo,
    })
    .promise();

  return todo;
}

export function update(id: String, todoUpdated: UpdateTodoRequest, userId: String) {
  console.log(`Id to be used in update item: ${id}. user id received was: ${userId}`)
  const documentClient = new AWS.DynamoDB.DocumentClient();
  return documentClient.update({
    TableName: 'Todo-dev',
    Key: {
      "todoId": id,
      "userId": userId
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

export async function deleteOne(id: string, userId: string) {
  const documentClient = new AWS.DynamoDB.DocumentClient();
  await documentClient.delete({
    TableName: 'Todo-dev',
    Key: {
      "todoId": id,
      "userId": userId
    },
    ConditionExpression: 'todoId = :todoId',
    ExpressionAttributeValues: {
      ':todoId': id
    }
  }).promise();
}



export async function getPresignedImageUrl(
  todoId: String,
  imageId: String,
  userId: String
): Promise < string > {

  console.log(`todoId: ${todoId} - imageId: ${imageId} - userId: ${userId}`)
  const documentClient = new AWS.DynamoDB.DocumentClient();
  const s3 = new AWS.S3();
  const attachmentUrl = await s3.getSignedUrl("putObject", {
    Bucket: '1523563-serverless-udagram-images-dev',
    Key: imageId,
    Expires: 300,
  });
  console.log(`Attachment url received was ${attachmentUrl}`);
  await documentClient.update({
      TableName: 'Todo-dev',
      Key: {
        "todoId": todoId,
        "userId": userId
      },
      UpdateExpression: "set attachmentUrl = :attachmentUrl",
      ExpressionAttributeValues: {
        ":attachmentUrl": `https://1523563-serverless-udagram-images-dev.s3.amazonaws.com/${imageId}`,
      },
    }).promise();
  return attachmentUrl;
}