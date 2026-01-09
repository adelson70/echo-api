import { Module } from '@nestjs/common';
import { EntradaController } from './entrada.controller';
import { EntradaService } from './entrada.service';
import { PrismaModule } from 'src/infra/database/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [EntradaController],
    providers: [EntradaService],
})
export class EntradaModule {}