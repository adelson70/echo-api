import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaReadService } from "src/infra/database/prisma/prisma-read.service";
import { PrismaWriteService } from "src/infra/database/prisma/prisma-write.service";
import { FindPerfilDto, ListPerfilDto } from "./dto/perfil.dto";
import { PermissaoDto } from "../sistema/dto/sistema.dto";
import { Perfil } from "@prisma/client";

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
                    _count: {
                        select: {
                            usuarios: true,
                        }
                    }
                }
            })
    
            return this.mapPerfilList(perfis);

        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.log(error);
            throw new InternalServerErrorException('Erro na listagem de perfis');
        }

    }

    async find(id: string): Promise<FindPerfilDto> {
        try {
            const perfilExistente = await this.prismaRead.perfil.findUnique({
                where: {
                    id: id,
                },
                select: {
                    id: true,
                    nome: true,
                    descricao: true,
                    _count: {
                        select: {
                            usuarios: true,
                        }
                    },
                    permissoes: true,
                }
            })

            if (!perfilExistente) throw new NotFoundException(`Perfil ${id} não encontrado`);

            return this.mapPerfil(perfilExistente);
            
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.log(error);
            throw new InternalServerErrorException('Erro ao buscar perfil');
        }
    }

    private async mapPerfil(perfil: any): Promise<FindPerfilDto> {
        return {
            id: perfil.id,
            nome: perfil.nome,
            descricao: perfil.descricao,
            permissoes: perfil.permissoes,
            quantidadeUsuarios: perfil._count.usuarios,
        } as FindPerfilDto;
    }

    private async mapPerfilList(perfis: any[]): Promise<ListPerfilDto[]> {
        return perfis.map(perfil => ({
            id: perfil.id,
            nome: perfil.nome,
            descricao: perfil.descricao,
            quantidadeUsuarios: perfil._count.usuarios,
        } as ListPerfilDto));
    }
}
