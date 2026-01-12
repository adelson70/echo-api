import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaReadService } from "src/infra/database/prisma/prisma-read.service";
import { PrismaWriteService } from "src/infra/database/prisma/prisma-write.service";
import { CreateFilaDto, FilaDto, ListFilaDto } from "./dto/fila.dto";
import { Prisma, queue_members, queues } from "@prisma/client";
import { FindFilaDto } from "./dto/fila.dto";

@Injectable()
export class FilaService {
    constructor(
        private readonly prismaRead: PrismaReadService,
        private readonly prismaWrite: PrismaWriteService) { }

    async list(): Promise<ListFilaDto[]> {
        try {
            const filas = await this.prismaRead.queues.findMany({
                select: {
                    name: true,
                    displayname: true,
                    strategy: true,
                    timeout: true,
                    retry: true,
                    musiconhold: true,
                    queue_members: {
                        select: {
                            ramal_id: true,
                        }
                    }
                }
            });

            if (filas.length === 0) throw new NotFoundException('Nenhuma fila encontrada');

            return this.mapFilaList(filas as unknown as Prisma.queuesGetPayload<{ include: { queue_members: true } }>[]);
        } catch (error) {
            throw new InternalServerErrorException('Erro ao listar filas');
        }
    }

    async find(fila: string): Promise<FindFilaDto> {

        try {
            const filaEncontrada = await this.prismaRead.queues.findFirst({
                where: {
                    name: fila,
                },
                select: {
                    name: true,
                    displayname: true,
                    strategy: true,
                    timeout: true,
                    retry: true,
                    musiconhold: true,
                    queue_members: {
                        select: {
                            ramal_id: true,
                        }
                    }
                },
            }) as unknown as Prisma.queuesGetPayload<{ include: { queue_members: true } }>;

            if (!filaEncontrada) throw new NotFoundException(`Fila ${fila} não encontrada`);

            return this.mapFila(filaEncontrada);

        } catch (error) {
            if (error instanceof HttpException) throw error;

            throw new InternalServerErrorException('Erro ao buscar fila');
        }
    }  

    async create(createFilaDto: CreateFilaDto): Promise<CreateFilaDto> {
        try {
            const filaExiste = await this.prismaRead.queues.findFirst({
                where: {
                    name: createFilaDto.nome,
                },
            });
            
            if (filaExiste) throw new BadRequestException(`Fila ${createFilaDto.nome} já existe`);

            const fila = await this.prismaWrite.queues.create({
                data: {
                    name: createFilaDto.nomeIdentificador,
                    displayname: createFilaDto.nome,
                    strategy: createFilaDto.estrategia,
                    timeout: createFilaDto.tempoEspera,
                    retry: createFilaDto.tentativas,
                    musiconhold: createFilaDto.musicaDeEspera,
                },
                select: {
                    name: true,
                    displayname: true,
                    strategy: true,
                    timeout: true,
                    retry: true,
                    musiconhold: true,
                    queue_members: {
                        select: {
                            ramal_id: true,
                        }
                    }
                }
            }) as unknown as Prisma.queuesGetPayload<{ include: { queue_members: true } }>;

            return this.mapFila(fila);

        } catch (error) {
            throw new InternalServerErrorException('Erro ao criar fila');
        }
    }

    async delete(fila: string): Promise<void> {
        try {
            await this.prismaWrite.queues.delete({
                where: {
                    name: fila,
                }
            });

            return;
        }
        catch (error) {
            if (error instanceof HttpException) throw error;

            throw new InternalServerErrorException('Erro ao deletar fila');
        }
    }

    private mapFila(fila: Prisma.queuesGetPayload<{ include: { queue_members: true } }>): FilaDto {
        return {
            nomeIdentificador: fila.name,
            nome: fila.displayname,
            estrategia: fila.strategy,
            tempoEspera: fila.timeout,
            tentativas: fila.retry,
            musicaDeEspera: fila.musiconhold,
            ramais: fila.queue_members?.map((member: queue_members) => member.ramal_id) || [],
        } as FilaDto;
    }

    private mapFilaList(
        filas: Prisma.queuesGetPayload<{ include: { queue_members: true } }>[]): ListFilaDto[] {
        const filasListadas = filas.map((fila) => {
            return {
                ...this.mapFila(fila),
                ramais: fila.queue_members?.map((member: queue_members) => member.ramal_id) || [],
            }
        });

        return filasListadas;
    }

}
