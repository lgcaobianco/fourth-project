import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { parseUserId } from '../../auth/utils'
import { save } from '../../repository/todo-repository'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const email = parseUserId(event.headers.Authorization.split(" ")[1]);
    const response = await save(newTodo, email);

    return {
      statusCode: 201,
      body: JSON.stringify(response)
    };
  });

handler.use(
  cors({
    credentials: true
  })
)
