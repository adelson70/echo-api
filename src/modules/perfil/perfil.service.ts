import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaReadService } from "src/infra/database/prisma/prisma-read.service";
import { PrismaWriteService } from "src/infra/database/prisma/prisma-write.service";
import { ListPerfilDto } from "./dto/perfil.dto";
import { PermissaoDto } from "../sistema/dto/sistema.dto";

@Injectable()
export class PerfilService {
    constructor(
        private readonly prismaRead: PrismaReadService, 
        private readonly prismaWrite: PrismaWriteService) 
    {}

    async list(): Promise<ListPerfilDto[]> {
        try {
            const perfis = await this.prismaRead.perfil.findMany({
                select: {
                    id: true,
                    nome: true,
                    descricao: true,
                    permissoes: true,
                    _count: {
                        select: {
                            usuarios: true,
                        }
                    }
                }
            })
    
            const perfisMapeados = perfis.map(perfil => ({
                id: perfil.id,
                nome: perfil.nome,
                descricao: perfil.descricao,
                permissoes: perfil.permissoes,
                quantidadeUsuarios: perfil._count.usuarios,
            } as ListPerfilDto));

            return perfisMapeados;

        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.log(error);
            throw new InternalServerErrorException('Erro na listagem de perfis');
        }

    }
}
