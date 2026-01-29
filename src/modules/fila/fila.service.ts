import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaReadService } from "src/infra/database/prisma/prisma-read.service";
import { PrismaWriteService } from "src/infra/database/prisma/prisma-write.service";
import { CreateFilaDto, FilaDto, ListFilaDto, UpdateFilaDto } from "./dto/fila.dto";
import { Prisma, queue_members, queues } from "@prisma/client";
import { FindFilaDto } from "./dto/fila.dto";
import { ToggleMemberDto } from "../ramal/dto/ramal.dto";

@Injectable()
export class FilaService {
    constructor(
        private readonly prismaRead: PrismaReadService,
        private readonly prismaWrite: PrismaWriteService) { }

    async list(): Promise<ListFilaDto[]> {
        try {
            const filas = await this.prismaRead.queues.findMany({
                select: {
                    id: true,
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
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException('Erro ao listar filas');
        }
    }

    async find(id: string): Promise<FindFilaDto> {

        try {
            const filaEncontrada = await this.prismaRead.queues.findFirst({
                where: {
                    id,
                },
                select: {
                    id: true,
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

            if (!filaEncontrada) throw new NotFoundException('Fila não encontrada');

            return this.mapFila(filaEncontrada);

        } catch (error) {
            if (error instanceof HttpException) throw error;

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2007') throw new InternalServerErrorException('UUID inválido');
            }

            throw new InternalServerErrorException('Erro ao buscar fila');
        }
    }  

    async create(dto: CreateFilaDto): Promise<CreateFilaDto> {
        try {
            const fila = await this.prismaWrite.queues.create({
                data: {
                    name: dto.nomeIdentificador,
                    displayname: dto.nome,
                    strategy: dto.estrategia,
                    timeout: dto.tempoEspera,
                    retry: dto.tentativas,
                    musiconhold: dto.musicaDeEspera,
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
            if (error instanceof HttpException) throw error;

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') throw new BadRequestException('Fila já existe');
            }

            throw new InternalServerErrorException('Erro ao criar fila');
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.prismaWrite.queues.delete({
                where: {
                    id,
                }
            });
        }
        catch (error) {
            if (error instanceof HttpException) throw error;

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2007') throw new InternalServerErrorException('UUID inválido');
                if (error.code === 'P2025') throw new NotFoundException('Fila não encontrada');
            }

            throw new InternalServerErrorException('Erro ao deletar fila');
        }
    }

    async update(id: string, dto: UpdateFilaDto): Promise<UpdateFilaDto> {
        try {
            if (Object.keys(dto).length === 0) throw new BadRequestException('Nenhum dado para atualizar');

            const filaAtualizada = await this.prismaWrite.queues.update({
                where: { id },
                data: dto,
            }) as unknown as Prisma.queuesGetPayload<{ include: { queue_members: true } }>;

            return this.mapFila(filaAtualizada);
            
        } catch (error) {
            if (error instanceof HttpException) throw error;

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2007') throw new InternalServerErrorException('UUID inválido');
                if (error.code === 'P2025') throw new NotFoundException('Fila não encontrada');
            }

            throw new InternalServerErrorException('Erro ao atualizar fila');
        }
    }

    async toggleMember(id: string, dto: ToggleMemberDto): Promise<boolean> {
        try {
            const ramalExiste = await this.prismaRead.ps_endpoints.findFirst({
                where: {
                    id: dto.ramal,
                },
            });

            if (!ramalExiste) throw new NotFoundException('Ramal não encontrado');

            const filaExiste = await this.prismaRead.queues.findFirst({
                where: {
                    id,
                },
            });

            if (!filaExiste) throw new NotFoundException('Fila não encontrada');

            const memberExiste = await this.prismaRead.queue_members.findFirst({
                where: {
                    queue_id: id,
                    ramal_id: dto.ramal,
                },
            });

            // Se o membro existe, remove ele da fila
            if (memberExiste) {
                await this.prismaWrite.queue_members.delete({
                    where: {
                        uniqueid: memberExiste.uniqueid,
                    },
                });
                return false;
            }

            // Se o membro não existe, adiciona ele à fila
            else {
                const data = {
                    queue_name: filaExiste.name,
                    queue_id: id,
                    ramal_id: dto.ramal,
                    interface: `PJSIP/${dto.ramal}`,
                    membername: dto.ramal,
                    penalty: 0,
                    paused: 0,
                }

                await this.prismaWrite.queue_members.create({
                    data,
                });
                return true;
            }
        }
        catch (error) {
            if (error instanceof HttpException) throw error;

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2007') throw new InternalServerErrorException('UUID inválido');
            }

            throw new InternalServerErrorException('Erro ao adicionar/remover membro à fila');
        }
    }

    private mapFila(fila: Prisma.queuesGetPayload<{ include: { queue_members: true } }>): FilaDto {
        return {
            id: fila.id,
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
