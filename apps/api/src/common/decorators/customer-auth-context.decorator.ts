import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const CustomerAuth = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest<Request>().customerAuth;
  }
);
