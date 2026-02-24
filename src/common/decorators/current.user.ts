import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { ReturnDocument } from "typeorm";


export const CurrentUser = createParamDecorator((data: any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()
    return request.user
})