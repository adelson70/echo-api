import { Module } from "@nestjs/common";
import { UsuarioController } from "./usuario.controller";
import { UsuarioService } from "./usuario.service";
import { PrismaModule } from "src/infra/database/prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [UsuarioController],
    providers: [UsuarioService],
})
export class UsuarioModule {}
