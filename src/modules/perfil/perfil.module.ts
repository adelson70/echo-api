import { Module } from "@nestjs/common";
import { PerfilController } from "./perfil.controller";
import { PerfilService } from "./perfil.service";
import { PrismaModule } from "src/infra/database/prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [PerfilController],
    providers: [PerfilService],
})
export class PerfilModule {}
