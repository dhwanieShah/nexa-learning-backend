import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private static getMessageCode(statusCode: number): string {
    return HttpStatus[statusCode] || 'UNKNOWN_ERROR';
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const statusCode = data?.statusCode || HttpStatus.OK;
        const messageCode = ResponseInterceptor.getMessageCode(statusCode);

        const message = data?.message || 'Hoạt động thành công';

        // Determine if it's an error based on the status code
        const isError = statusCode >= 400;

        const response = {
          error: isError,
          message,
          statusCode,
          messageCode,
          data: data?.data !== undefined ? data.data : data || null, // Ensure null if no data
        };

        return response;
      }),
    );
  }
}
