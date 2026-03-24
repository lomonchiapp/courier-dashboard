import { Controller, Get, Res } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import { Response } from "express";
import { join } from "path";
import { Public } from "@/common/decorators/public.decorator";

@ApiExcludeController()
@Controller()
export class DocsController {
  @Public()
  @Get("docs")
  serveDocs(@Res() res: Response) {
    res.sendFile(join(__dirname, "api-docs.html"));
  }
}
