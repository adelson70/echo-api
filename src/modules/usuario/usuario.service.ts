import { BadRequestException, ForbiddenException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaReadService } from "src/infra/database/prisma/prisma-read.service";
import { PrismaWriteService } from "src/infra/database/prisma/prisma-write.service";
import { AddPermissaoDto, CreateUsuarioDto, FindUsuarioDto, ListUsuarioDto, UpdateUsuarioDto } from "./dto/usuario.dto";
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
                    perfil: {
                        select: {
                            nome: true,
                            permissoes: {
                                select: {
                                    modulo: true,
                                    criar: true,
                                    ler: true,
                                    editar: true,
                                    deletar: true,
                                }
                            }
                        }
                    },
                    permissoesUsuario: {
                        select: {
                            modulo: true,
                            criar: true,
                            ler: true,
                            editar: true,
                            deletar: true,
                        }
                    }
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

            const usuarioEncontrado = await this.prismaRead.usuario.findUnique({ where, select: {
                id: true,
                nome: true,
                email: true,
                is_admin: true,
                perfil_id: true,
                last_login: true,
                perfil: {
                    select: {
                        nome: true,
                        permissoes: {
                            select: {
                                modulo: true,
                                criar: true,
                                ler: true,
                                editar: true,
                                deletar: true,
                            }
                        }
                    }
                },
                permissoesUsuario: {
                    select: {
                        modulo: true,
                        criar: true,
                        ler: true,
                        editar: true,
                        deletar: true,
                    }
                }
            } });

            if (!usuarioEncontrado) throw new NotFoundException('Usuário não encontrado');

            return usuarioEncontrado as FindUsuarioDto;

        } catch (error) {
            if (error instanceof HttpException) throw error;

            throw new InternalServerErrorException('Erro ao buscar usuário pelo id');
        }
    }

    async create(createUsuarioDto: CreateUsuarioDto, usuario: UsuarioPayload): Promise<CreateUsuarioDto> {
        try {
            const usuarioEncontrado = await this.prismaRead.usuario.findUnique({ where: { email: createUsuarioDto.email } });

            if (usuarioEncontrado) throw new BadRequestException('Usuário já existe');

            if (!usuario.is_admin && createUsuarioDto.is_admin) throw new ForbiddenException('Você não tem permissão para criar um usuário administrador');

            if (createUsuarioDto.perfil_id) {
                const perfil = await this.prismaRead.perfil.findUnique({ where: { id: createUsuarioDto.perfil_id } });
             
                if (!perfil) throw new BadRequestException('Perfil não encontrado');
            }

            const usuarioCriado = await this.prismaWrite.usuario.create({ data: createUsuarioDto });

            return usuarioCriado as CreateUsuarioDto;
            
        } catch (error) {
            if (error instanceof HttpException) throw error;

            throw new InternalServerErrorException('Erro ao criar usuário');
        }
    }

    async update(id: string, updateUsuarioDto: UpdateUsuarioDto, usuario: UsuarioPayload): Promise<UpdateUsuarioDto> {
        try {
            const usuarioEncontrado = await this.prismaRead.usuario.findUnique({ where: { id } });

            if (!usuarioEncontrado) throw new NotFoundException('Usuário não encontrado');

            if (!usuario.is_admin && updateUsuarioDto.is_admin) throw new ForbiddenException('Você não tem permissão para trocar o status de administrador do usuário');

            if (updateUsuarioDto.perfil_id) {
                const perfil = await this.prismaRead.perfil.findUnique({ where: { id: updateUsuarioDto.perfil_id } });

                if (!perfil) throw new BadRequestException('Perfil não encontrado');
            }

            const usuarioAtualizado = await this.prismaWrite.usuario.update({ where: { id }, data: updateUsuarioDto });

            return usuarioAtualizado as UpdateUsuarioDto;
        } catch (error) {
            if (error instanceof HttpException) throw error;

            throw new InternalServerErrorException('Erro ao atualizar usuário');
        }
    }

    async delete(id: string, usuario: UsuarioPayload): Promise<void> {
        try {
            const usuarioEncontrado = await this.prismaRead.usuario.findUnique({ where: { id } });

            if (!usuarioEncontrado) throw new NotFoundException('Usuário não encontrado');

            if (!usuario.is_admin && usuarioEncontrado.is_admin) throw new ForbiddenException('Você não tem permissão para deletar um usuário que é administrador');

            await this.prismaWrite.usuario.delete({ where: { id } });
        }
        catch (error) {
            if (error instanceof HttpException) throw error;

            throw new InternalServerErrorException('Erro ao deletar usuário');
        }
    }

    async addPermissao(addPermissaoDto: AddPermissaoDto): Promise<void> {
        try {
            // console.log(addPermissaoDto);

            const permissoesExistentes = await this.prismaRead.permissaoUsuario.findMany({ where: { usuario_id: addPermissaoDto.usuario_id }, select: { modulo: true } });

            const permissoesParaAtualizar = addPermissaoDto.permissoes.filter(permissao => permissoesExistentes.some(permissaoExistente => permissaoExistente.modulo === permissao.modulo));

            const permissoesParaCriar = addPermissaoDto.permissoes.filter(permissao => !permissoesExistentes.some(permissaoExistente => permissaoExistente.modulo === permissao.modulo));

            console.log(permissoesParaAtualizar);
            console.log(permissoesParaCriar);

            // SE EXISTEM PERMISSÕES, ATUALIZA AS PERMISSÕES
            if (permissoesParaAtualizar.length > 0 ) {
                await this.prismaWrite.$transaction(
                    permissoesParaAtualizar.map(permissao => 
                        this.prismaWrite.permissaoUsuario.updateMany({
                            where: { modulo: permissao.modulo, usuario_id: addPermissaoDto.usuario_id },
                            data: {
                                criar: permissao.criar,
                                ler: permissao.ler,
                                editar: permissao.editar,
                                deletar: permissao.deletar,
                            }
                        })
                    )
                )
            }

            // SE NÃO EXISTEM PERMISSÕES, CRIA AS PERMISSÕES
            if (permissoesParaCriar.length > 0 ) {
                await this.prismaWrite.$transaction(async (tx) => {
                    await tx.permissaoUsuario.createMany({
                        data: permissoesParaCriar.map(permissao => ({
                            usuario_id: addPermissaoDto.usuario_id,
                            modulo: permissao.modulo,
                            criar: permissao.criar,
                            ler: permissao.ler,
                            editar: permissao.editar,
                            deletar: permissao.deletar,
                        }))
                    })
                })
            }
            return;
            
        } catch (error) {
            if (error instanceof HttpException) throw error;

            console.log(error);

            throw new InternalServerErrorException('Erro ao adicionar permissão ao usuário');
        }
    }
}
