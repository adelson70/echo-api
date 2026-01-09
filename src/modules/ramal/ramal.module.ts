import { PrismaModule } from "src/infra/database/prisma/prisma.module"
import { Module } from "@nestjs/common";
import { RamalController } from "./ramal.controller";
import { RamalService } from "./ramal.service";

@Module({
    imports: [PrismaModule],
    controllers: [RamalController],
    providers: [RamalService],
})
export class RamalModule {}