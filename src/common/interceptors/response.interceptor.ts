import { 
  CallHandler, 
  ExecutionContext, 
  Injectable, 
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type WithMessage<T = unknown> = {
  message: string;
  data?: T;
};

function hasMessage<T = unknown>(value: unknown): value is WithMessage<T> {
  return !!value && typeof value === 'object' && 'message' in value;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    const handler = context.getHandler();
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode || 200;

    // Busca os metadados do Swagger
    const swaggerMetadata = this.reflector.getAll('swagger/apiResponse', [handler]) || 
                           this.reflector.getAll('swagger/api_response', [handler]) ||
                           this.reflector.getAll('apiResponse', [handler]);
    
    // Extrai a description do status code correspondente
    let message = 'Operação realizada com sucesso';
    
    if (Array.isArray(swaggerMetadata)) {
      // Itera sobre o array de objetos
      for (const responseObj of swaggerMetadata) {
        if (responseObj && typeof responseObj === 'object') {
          // Procura pela chave que corresponde ao status code (como string)
          const statusKey = String(statusCode);
          if (statusKey in responseObj) {
            const responseData = responseObj[statusKey];
            if (responseData && typeof responseData === 'object' && 'description' in responseData) {
              message = responseData.description as string;
              break;
            }
          }
        }
      }
    }

    return next.handle().pipe(
      map((data) => {
        if (hasMessage(data)) {
          // usa a mensagem que veio no retorno
          return {
            success: true,
            message: data.message,
            data: data.data ?? null,
          };
        }

        // Usa a description do @ApiResponse se disponível, senão usa padrão
        return {
          success: true,
          message,
          data: data || null,
        };
      }),
    );
  }
}