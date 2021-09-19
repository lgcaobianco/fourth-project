import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { parseUserId } from '../../auth/utils'
import { deleteOne } from '../../repository/todo-repository'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const email = parseUserId(event.headers.Authorization.split(" ")[1]);

    await deleteOne(todoId, email);

    
    return {
      statusCode: 200,
      body: JSON.stringify(true)
    }
  }
);

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
