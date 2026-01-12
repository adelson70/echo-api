import { Injectable } from "@nestjs/common";
import { PrismaReadService } from "src/infra/database/prisma/prisma-read.service";
import { PrismaWriteService } from "src/infra/database/prisma/prisma-write.service";
import { ListUsuarioDto } from "./dto/usuario.dto";
import { UsuarioPayload } from "src/common/decorators/usuario.decorator";
import { Prisma } from "@prisma/client";

@Injectable()
export class UsuarioService {
    constructor(
        private readonly prismaRead: PrismaReadService, 
        private readonly prismaWrite: PrismaWriteService) 
    {}

    async list(usuario: UsuarioPayload): Promise<ListUsuarioDto[]> {

        let where: Prisma.UsuarioWhereInput = { };

        if (!usuario.is_admin) where.is_admin = false;

        return await this.prismaRead.usuario.findMany({ 
            where, 
            select: {
                id: true,
                nome: true,
                email: true,
                is_admin: true,
                perfil_id: true,
                last_login: true,
            } 
        }) as ListUsuarioDto[];
    }
}
