import { BadRequestException, ForbiddenException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaReadService } from "src/infra/database/prisma/prisma-read.service";
import { PrismaWriteService } from "src/infra/database/prisma/prisma-write.service";
import { CreateUsuarioDto, FindUsuarioDto, ListUsuarioDto } from "./dto/usuario.dto";
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
}
