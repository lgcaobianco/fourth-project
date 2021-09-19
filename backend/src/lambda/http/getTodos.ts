import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import {findAllByEmail} from '../../repository/todo-repository';
import { parseUserId } from '../../auth/utils'

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("[INFO] get has been received");
    const email = parseUserId(event.headers.Authorization.split(" ")[1]);
    
    const todoList = await findAllByEmail(email);

    return {
      statusCode: 200,
      body: JSON.stringify({items: todoList.Items})
    }
  });

handler.use(
  cors({
    credentials: true
  })
)
