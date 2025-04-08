import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseModel<T> {
  @ApiProperty({ example: HttpStatus.OK })
  code: number;

  @ApiProperty({ example: 'success' })
  msg: string;

  @ApiProperty({ description: '实际返回数据' })
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseModel<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseModel<T>> {
    return next.handle().pipe(
      map(data => ({
        code: HttpStatus.OK,
        msg: 'success',
        data,
      })),
    );
  }
} 