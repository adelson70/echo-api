import { Module } from "@nestjs/common";
import { SistemaController } from "./sistema.controller";
import { SistemaService } from "./sistema.service";
import { PrismaModule } from "src/infra/database/prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [SistemaController],
    providers: [SistemaService],
})
export class SistemaModule {}
