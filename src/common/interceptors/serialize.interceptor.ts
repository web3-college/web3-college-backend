import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Observable, map } from 'rxjs';

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any, private flag: boolean = false) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: this.flag,
          enableImplicitConversion: true
        });
      })
    )
  }
}
