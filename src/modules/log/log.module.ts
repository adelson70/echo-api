import { Module, Global } from "@nestjs/common";
import { LogController } from "./log.controller";
import { LogService } from "./log.service";
import { PrismaModule } from "src/infra/database/prisma/prisma.module";

@Global()
@Module({
    imports: [PrismaModule],
    controllers: [LogController],
    providers: [LogService],
    exports: [LogService],
})
export class LogModule {}
