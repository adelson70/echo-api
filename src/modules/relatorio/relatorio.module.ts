import { Module } from "@nestjs/common";
import { RelatorioController } from "./relatorio.controller";
import { RelatorioService } from "./relatorio.service";
import { PrismaModule } from "src/infra/database/prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [RelatorioController],
    providers: [RelatorioService],
})
export class RelatorioModule {}
