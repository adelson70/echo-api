import { Module } from "@nestjs/common";
import { GrupoDeCapturaController } from "./grupo-de-captura.controller";
import { GrupoDeCapturaService } from "./grupo-de-captura.service";
import { PrismaModule } from "src/infra/database/prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [GrupoDeCapturaController],
    providers: [GrupoDeCapturaService],
})
export class GrupoDeCapturaModule {}
