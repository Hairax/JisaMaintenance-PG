import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

// Por defecto Nest convierte cualquier excepción no-RPC (UnauthorizedException,
// BadRequestException, Error...) en un "Internal server error" genérico al
// cruzar el transporte TCP, y el gateway terminaba devolviendo 500 sin el
// mensaje real. Este filtro envía { statusCode, message } para que el gateway
// responda con el código y el mensaje correctos (ej. 401 "Contraseña incorrecta").
@Catch()
export class RpcErrorFilter extends BaseRpcExceptionFilter {
  private readonly logger = new Logger('RpcErrorFilter');

  catch(exception: unknown, host: ArgumentsHost): Observable<unknown> {
    if (exception instanceof RpcException) {
      return super.catch(exception, host);
    }
    if (exception instanceof HttpException) {
      return throwError(() => ({
        statusCode: exception.getStatus(),
        message: exception.message,
      }));
    }
    this.logger.error(exception);
    const message =
      exception instanceof Error ? exception.message : 'Error interno';
    return throwError(() => ({ statusCode: 500, message }));
  }
}
