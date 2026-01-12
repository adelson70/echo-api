import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaReadService } from "src/infra/database/prisma/prisma-read.service";
import { PrismaWriteService } from "src/infra/database/prisma/prisma-write.service";
import { CreateFilaDto } from "./dto/fila.dto";

@Injectable()
export class FilaService {
    constructor(
        private readonly prismaRead: PrismaReadService,
        private readonly prismaWrite: PrismaWriteService) { }

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
            });

            return {
                nome: fila.name,
                estrategia: fila.strategy,
                tempoEspera: fila.timeout,
                tentativas: fila.retry,
                musicaDeEspera: fila.musiconhold,
            } as CreateFilaDto;

        } catch (error) {
            throw new InternalServerErrorException('Erro ao criar fila');
        }
    }

}
