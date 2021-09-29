import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import {
  CreateTodoRequest
} from '../../requests/CreateTodoRequest'
import {
  parseUserId
} from '../../auth/utils'
import {
  save
} from '../../repository/todo-repository'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise < APIGatewayProxyResult > => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    if (newTodo.name == null || newTodo.name.trim().length < 1) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          field: 'name',
          error: 'cant save empty todo'
        })
      };
    }
    const userId = parseUserId(event.headers.Authorization.split(" ")[1]);
    const todo = await save(newTodo, userId);
    console.log("todo created:" + JSON.stringify(todo));

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item: todo
      })
    };
  });