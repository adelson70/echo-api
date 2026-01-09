import { Module } from "@nestjs/common";
import { FilaController } from "./fila.controller";
import { FilaService } from "./fila.service";
import { PrismaModule } from "src/infra/database/prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [FilaController],
    providers: [FilaService],
})
export class FilaModule {}
