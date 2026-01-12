import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaReadService } from "src/infra/database/prisma/prisma-read.service";
import { PrismaWriteService } from "src/infra/database/prisma/prisma-write.service";
import { FindUsuarioDto, ListUsuarioDto } from "./dto/usuario.dto";
import { UsuarioPayload } from "src/common/decorators/usuario.decorator";
import { Prisma } from "@prisma/client";

@Injectable()
export class UsuarioService {
    constructor(
        private readonly prismaRead: PrismaReadService, 
        private readonly prismaWrite: PrismaWriteService) 
    {}

    async list(usuario: UsuarioPayload): Promise<ListUsuarioDto[]> {

        try {
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
            
        } catch (error) {
            if (error instanceof HttpException) throw error;

            throw new InternalServerErrorException('Erro na listagem de usuários');
        }

    }

    async find(id: string, usuario: UsuarioPayload): Promise<FindUsuarioDto> {
        try {
            let where: Prisma.UsuarioWhereUniqueInput = { id };

            if (!usuario.is_admin) where.is_admin = false;

            const usuarioEncontrado = await this.prismaRead.usuario.findUnique({ where });

            if (!usuarioEncontrado) throw new NotFoundException('Usuário não encontrado');

            return usuarioEncontrado as FindUsuarioDto;

        } catch (error) {
            if (error instanceof HttpException) throw error;

            throw new InternalServerErrorException('Erro ao buscar usuário pelo id');
        }
    }
}
