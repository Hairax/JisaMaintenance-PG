import {
  CallHandler,
  ExecutionContext,
  GatewayTimeoutException,
  HttpException,
  Injectable,
  NestInterceptor,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

// Tiempo máximo que el gateway espera a un microservicio. Sin esto, si un
// servicio no responde (caído, puerto/host mal configurado) la petición del
// navegador quedaba "Pending" indefinidamente.
const TIMEOUT_MS = Number(process.env.MICROSERVICE_TIMEOUT_MS) || 15000;

const esConexionRechazada = (err: { code?: string; message?: string }) =>
  ['ECONNREFUSED', 'ECONNRESET', 'EHOSTUNREACH', 'ENOTFOUND'].some(
    (c) => err?.code === c || err?.message?.includes(c),
  );

@Injectable()
export class MicroserviceInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      timeout(TIMEOUT_MS),
      catchError((err: unknown) => {
        if (err instanceof HttpException) return throwError(() => err);
        if (err instanceof TimeoutError) {
          return throwError(
            () =>
              new GatewayTimeoutException(
                'El servicio no respondió a tiempo. Intente nuevamente.',
              ),
          );
        }
        const e = err as {
          code?: string;
          message?: string;
          statusCode?: number;
        };
        if (esConexionRechazada(e)) {
          return throwError(
            () =>
              new ServiceUnavailableException(
                'Servicio no disponible. Verifique que todos los servicios estén levantados.',
              ),
          );
        }
        // Errores enviados por RpcErrorFilter de los microservicios.
        if (typeof e?.statusCode === 'number') {
          return throwError(
            () =>
              new HttpException(e.message ?? 'Error', e.statusCode as number),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
