import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaReadService } from "src/infra/database/prisma/prisma-read.service";
import { PrismaWriteService } from "src/infra/database/prisma/prisma-write.service";
import { CreatePerfilDto, FindPerfilDto, ListPerfilDto, UpdatePerfilDto } from "./dto/perfil.dto";

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

    async create(createPerfilDto: CreatePerfilDto): Promise<CreatePerfilDto> {
        try {
            const perfilExistente = await this.prismaRead.perfil.findUnique({
                where: {
                    nome: createPerfilDto.nome,
                },
            })

            if (perfilExistente) throw new BadRequestException(`Perfil ${createPerfilDto.nome} já existe`, { cause: 'Perfil já existe' });

            const perfilCriado = await this.prismaWrite.perfil.create({
                data: {
                    nome: createPerfilDto.nome,
                    descricao: createPerfilDto.descricao || '',
                    permissoes: {
                        create: createPerfilDto.permissoes.map(permissao => ({
                            modulo: permissao.modulo,
                            criar: permissao.criar,
                            ler: permissao.ler,
                            editar: permissao.editar,
                            deletar: permissao.deletar,
                        })),
                    },
                },
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

            return this.mapPerfil(perfilCriado);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.log(error);
            throw new InternalServerErrorException('Erro ao criar perfil');
        }
    }

    async update(id: string, updatePerfilDto: UpdatePerfilDto): Promise<UpdatePerfilDto> {
        try {
            const perfilExistente = await this.prismaRead.perfil.findUnique({
                where: {
                    id: id,
                },
            })

            if (!perfilExistente) throw new NotFoundException(`Perfil ${id} não encontrado`);

            const perfilAtualizado = await this.prismaWrite.perfil.update({
                where: {
                    id: id,
                },
                data: updatePerfilDto,
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

            return this.mapPerfil(perfilAtualizado);

        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.log(error);
            throw new InternalServerErrorException('Erro ao atualizar perfil');
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const perfilExistente = await this.prismaRead.perfil.findUnique({
                where: {
                    id: id,
                },
            })

            if (!perfilExistente) throw new NotFoundException(`Perfil ${id} não encontrado`);

            await this.prismaWrite.perfil.delete({
                where: {
                    id: id,
                },
            })

            return;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.log(error);
            throw new InternalServerErrorException('Erro ao deletar perfil');
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
