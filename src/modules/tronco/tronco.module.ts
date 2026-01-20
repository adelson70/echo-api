import { Module } from "@nestjs/common";
import { TroncoController } from "./tronco.controller";
import { TroncoService } from "./tronco.service";
import { PrismaModule } from "src/infra/database/prisma/prisma.module";
import { SshModule } from "src/infra/ssh/ssh.module";

@Module({
    imports: [PrismaModule, SshModule],
    controllers: [TroncoController],
    providers: [TroncoService],
})
export class TroncoModule {}
