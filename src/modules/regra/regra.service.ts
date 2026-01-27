import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaReadService } from "src/infra/database/prisma/prisma-read.service";
import { PrismaWriteService } from "src/infra/database/prisma/prisma-write.service";
import { ListRegraDto, RegraCompletoDto } from "./dto/regra.dto";
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
            throw new InternalServerErrorException('Erro ao buscar regra');
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