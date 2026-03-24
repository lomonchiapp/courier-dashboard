import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on("finish", () => {
      const ms = Date.now() - start;
      const { method, originalUrl } = req;
      const status = res.statusCode;
      const tenantId = req.auth?.tenantId ?? "-";
      const contentLength = res.get("content-length") ?? "-";

      this.logger.log(
        `${method} ${originalUrl} ${status} ${ms}ms ${contentLength}b tenant=${tenantId}`
      );
    });

    next();
  }
}
