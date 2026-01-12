import { HttpException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaReadService } from "src/infra/database/prisma/prisma-read.service";
import { CreateLogDto, LogDto } from "./dto/log.dto";
import { PrismaWriteService } from "src/infra/database/prisma/prisma-write.service";
import { InputJsonValue, JsonValue } from "@prisma/client/runtime/client";
import { LogStatus } from "@prisma/client";

@Injectable()
export class LogService {
    constructor(
        private readonly prismaRead: PrismaReadService,
        private readonly prismaWrite: PrismaWriteService
    ) 
    {}

    async getAll(): Promise<LogDto[]> {
        try {
            return this.prismaRead.log.findMany({
                orderBy: { createdAt: 'desc' },
            });
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException('Erro ao listar logs');
        }
    }

    async create(createLogDto: CreateLogDto): Promise<string> {
        try {
            const log = await this.prismaWrite.log.create({
                data: {
                    usuario_id: createLogDto.usuario_id ?? null,
                    ip: createLogDto.ip,
                    status: createLogDto.status,
                    acao: createLogDto.acao,
                    modulo: createLogDto.modulo,
                    metaData: createLogDto.metaData as InputJsonValue,
                },
            });
            return log.id;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException('Erro ao criar log');
        }
    }

    async updateStatus(
        logId: string,
        status: LogStatus,
        metaData?: Record<string, any>
    ): Promise<void> {
        try {
            await this.prismaWrite.log.update({
                where: { id: logId },
                data: {
                    status,
                    metaData: metaData 
                        ? ({ ...metaData } as InputJsonValue)
                        : undefined,
                },
            });
        } catch (error) {
            if (error instanceof HttpException) throw error;
            // Não lança erro para não quebrar a requisição (fail silently)
            console.error('Erro ao atualizar status do log:', error);
        }
    }
}
