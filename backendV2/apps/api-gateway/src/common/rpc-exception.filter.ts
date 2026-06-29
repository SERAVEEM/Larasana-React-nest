import {
  Catch, ExceptionFilter, ArgumentsHost,
  HttpException, HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Catches errors thrown by TCP microservices and forwards
 * the original status code + message to the HTTP client.
 *
 * Microservices use AllExceptionsToRpcFilter which wraps
 * HttpExceptions as RpcExceptions with payload:
 *   { statusCode: 401, message: "...", error: "Unauthorized" }
 *
 * NestJS ClientProxy delivers these as plain objects to the
 * gateway's error handler.
 */
@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    // 1. Standard NestJS HttpException (thrown locally in gateway)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      return res.status(status).json(
        typeof body === 'string' ? { statusCode: status, message: body } : body,
      );
    }

    // 2. RPC error from microservice
    //    Shape: { status: "error", message: string | { statusCode, message, error } }
    //    The `message` field may be:
    //      - A JSON string containing { statusCode, message, error }
    //      - A string (generic errors)
    //      - An object with { statusCode, message, error } (our custom filter payload)
    let payload = exception?.message;

    if (typeof payload === 'string') {
      try {
        const parsed = JSON.parse(payload);
        if (parsed && typeof parsed === 'object' && typeof parsed.statusCode === 'number') {
          payload = parsed;
        }
      } catch (err) {
        // Not a JSON string, leave as string
      }
    }

    // If payload is an object with statusCode, use that
    if (payload && typeof payload === 'object' && typeof payload.statusCode === 'number') {
      return res.status(payload.statusCode).json({
        statusCode: payload.statusCode,
        message: payload.message ?? 'Error',
        error: payload.error,
      });
    }

    // If the exception itself has a numeric statusCode
    if (typeof exception?.statusCode === 'number' && exception.statusCode >= 100 && exception.statusCode < 600) {
      return res.status(exception.statusCode).json({
        statusCode: exception.statusCode,
        message: exception.message ?? 'Error',
      });
    }

    // Fallback: generic 500
    const message = typeof payload === 'string' ? payload : (exception?.message ?? 'Internal server error');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
    });
  }
}
