import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { parseUserId } from '../../auth/utils'
import { update } from '../../repository/todo-repository'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

    const email = parseUserId(event.headers.Authorization.split(" ")[1]);

    const response = update(todoId, updatedTodo, email);

    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };
  });

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
