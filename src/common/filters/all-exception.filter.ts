import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import * as requestIp from 'request-ip';

@Catch()
export class AllExceptionFilter<T> implements ExceptionFilter {
  private readonly logger = new Logger();
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
  catch(exception: T, host: ArgumentsHost) {
    console.log('exception', exception);
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const httpStatus = 
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const msg: unknown = exception['response'] || 'Internal Server Error';
    const responseBody = {
      headers: request.headers,
      body: request.body,
      query: request.query,
      params: request.params,
      timestamp: new Date().toISOString(),
      ip: requestIp.getClientIp(request),
      exception: exception['name'],
      error: msg,
    };
    this.logger.error(responseBody);
    httpAdapter.reply(response, responseBody, httpStatus);
  }
}
