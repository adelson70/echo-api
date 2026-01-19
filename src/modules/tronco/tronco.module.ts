import { Module } from "@nestjs/common";
import { TroncoController } from "./tronco.controller";
import { TroncoService } from "./tronco.service";
import { PrismaModule } from "src/infra/database/prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [TroncoController],
    providers: [TroncoService],
})
export class TroncoModule {}
