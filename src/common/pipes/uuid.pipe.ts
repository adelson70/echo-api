import { BadRequestException, ParseUUIDPipe } from '@nestjs/common';

export class UuidPipe extends ParseUUIDPipe {
  constructor() {
    super({
      exceptionFactory: () => {
        return new BadRequestException('ID inválido. Informe um UUID válido.');
      },
    });
  }
}
