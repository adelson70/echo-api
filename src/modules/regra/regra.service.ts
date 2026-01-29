import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaReadService } from "src/infra/database/prisma/prisma-read.service";
import { PrismaWriteService } from "src/infra/database/prisma/prisma-write.service";
import { CreateRegraDto, ListRegraDto, RegraCompletoDto, UpdateRegraDto } from "./dto/regra.dto";
import { context_values, Prisma } from "@prisma/client";

@Injectable()
export class RegraService {
    constructor(
        private readonly prismaRead: PrismaReadService, 
        private readonly prismaWrite: PrismaWriteService,
    ) { }

    async list(tipo?: context_values): Promise<ListRegraDto[]> {
        try {
            const where: Prisma.dialplanWhereInput = { };
            if (tipo) where.type = tipo;
            const regras = await this.prismaRead.dialplan.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    description: true,
                    type: true,
                    extensions: {
                        select: {
                            id: true,
                            context: true,
                            exten: true,
                            priority: true,
                            app: true,
                            appdata: true,
                        }
                    }
                }
            })
            return this.mapRegraList(regras);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException('Erro ao listar regras');
        }
    }

    async find(id: string): Promise<RegraCompletoDto> {
        try {
            const regra = await this.prismaRead.dialplan.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    type: true,
                    extensions: {
                        select: {
                            id: true,
                            context: true,
                            exten: true,
                            priority: true,
                            app: true,
                            appdata: true,
                        }
                    }
                }
            })
            if (!regra) throw new NotFoundException('Regra não encontrada');

            return this.mapRegra(regra);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2007') throw new InternalServerErrorException('UUID inválido');
            }
            throw new InternalServerErrorException('Erro ao buscar regra');
        }
    }

    async create(dto: CreateRegraDto): Promise<ListRegraDto> {
        try {
            const regra = await this.prismaWrite.dialplan.create({
                data: {
                    name: dto.nome,
                    description: dto.descricao,
                    type: dto.tipo,
                    extensions: {
                        create: dto.regra.map(r => ({
                            context: dto.tipo,
                            exten: r.rota,
                            priority: r.prioridade,
                            app: r.acao,
                            appdata: r.parametros,
                        }))
                    }
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    type: true,
                    extensions: {
                        select: {
                            id: true,
                            context: true,
                            exten: true,
                            priority: true,
                            app: true,
                            appdata: true,
                        }
                    }
                }
            });

            return this.mapRegra(regra);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.log(error);
            throw new InternalServerErrorException('Erro ao criar regra');
        }
    }

    async update(id: string, dto: UpdateRegraDto): Promise<ListRegraDto> {
        try {
            return this.mapRegra(dto);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2007') throw new InternalServerErrorException('UUID inválido');
                if (error.code === 'P2025') throw new NotFoundException('Regra não encontrada');
            }
            throw new InternalServerErrorException('Erro ao atualizar regra');
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.prismaWrite.dialplan.delete({
                where: { id },
            })
        } catch (error) {
            if (error instanceof HttpException) throw error;
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2007') throw new InternalServerErrorException('UUID inválido');
                if (error.code === 'P2025') throw new NotFoundException('Regra não encontrada');
            }
            throw new InternalServerErrorException('Erro ao deletar regra');
        }
    }

    private mapRegraList(regra: any): ListRegraDto[] {
        return regra.map((r: any) => this.mapRegra(r));
    }

    private mapRegra(regra: any): ListRegraDto {
        return {
            id: regra.id,
            nome: regra.name,
            descricao: regra.description || '',
            tipo: regra.type,
            regra: regra.extensions.map((r: any) => {
                return {
                    id: r.id.toString(),
                    rota: r.exten,
                    prioridade: r.priority,
                    acao: r.app,
                    parametros: r.appdata,
                }
            })
        }
    }

}