import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

/**
 * Catches HttpExceptions thrown inside microservices and
 * re-throws them as RpcExceptions that preserve the
 * original statusCode + message so the API Gateway can
 * forward them to the client.
 *
 * Without this, NestJS's default RpcExceptionsHandler
 * swallows the details and sends { status: "error", message: "Internal server error" }.
 */
@Catch()
export class AllExceptionsToRpcFilter extends BaseRpcExceptionFilter {
  catch(exception: any, host: any): Observable<any> {
    // If it's already an RpcException, let the base handle it
    if (exception instanceof RpcException) {
      return super.catch(exception, host);
    }

    // Extract info from HttpException (UnauthorizedException, ConflictException, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const message =
        typeof response === 'string'
          ? response
          : (response as any)?.message ?? exception.message;

      return throwError(() => new RpcException({
        statusCode: status,
        message,
        error: HttpStatus[status] ?? 'Error',
      }));
    }

    // Generic / unknown error
    return throwError(() => new RpcException({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: exception?.message ?? 'Internal server error',
      error: 'Internal Server Error',
    }));
  }
}
