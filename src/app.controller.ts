import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import RequestDTO from './requestDTO';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('validate')
  validateDataToSchema(@Body() requestDTO: RequestDTO) {
    return this.appService.validateTrafficData(
      JSON.parse(requestDTO.schema.replace(/[\t\n\r]/gm, '')),
      JSON.parse(requestDTO.trafficData.replace(/[\t\n\r]/gm, '')),
    );
  }
}
