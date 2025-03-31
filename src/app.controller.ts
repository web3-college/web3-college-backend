import { Controller, Get, Version } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  getHello(): string {
    return 'hello';
  }

  @Get()
  @Version('2')
  getHello2(): string {
    return 'hello2';
  }
}
