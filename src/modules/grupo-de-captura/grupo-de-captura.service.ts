import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaReadService } from "src/infra/database/prisma/prisma-read.service";
import { PrismaWriteService } from "src/infra/database/prisma/prisma-write.service";
import { CreateGrupoDeCapturaDto, FindGrupoDeCapturaDto, ListGrupoDeCapturaDto, ToggleGrupoDeCapturaDto, UpdateGrupoDeCapturaDto } from "./dto/grupo-de-captura.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class GrupoDeCapturaService {
    constructor(
        private readonly prismaRead: PrismaReadService, 
        private readonly prismaWrite: PrismaWriteService) 
    {}

    async list(): Promise<ListGrupoDeCapturaDto[]> {
        try {
            const grupoDeCapturas = await this.prismaRead.ps_pickup_groups.findMany({
                select: {
                    id: true,
                    name: true,
                    members: {
                        select: {
                            endpoint_id: true,
                        }
                    }
                }
            });
            return grupoDeCapturas.map(this.mapGrupoDeCaptura);
            
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException('Erro na listagem de grupos de captura');
        }
    }

    async find(id: string): Promise<FindGrupoDeCapturaDto> {
        try {
            const grupoDeCapturaExiste = await this.prismaRead.ps_pickup_groups.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    members: {
                        select: {
                            endpoint_id: true,
                        }
                    }
                }
            });
            if (!grupoDeCapturaExiste) throw new NotFoundException('Grupo de captura não encontrado');
            
            return this.mapGrupoDeCaptura(grupoDeCapturaExiste);
            
        } catch (error) {
            if (error instanceof HttpException) throw error;
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2007') throw new InternalServerErrorException('UUID inválido');
            }
            throw new InternalServerErrorException('Erro ao buscar grupo de captura');
        }
    }

    async create(dto: CreateGrupoDeCapturaDto): Promise<CreateGrupoDeCapturaDto> {
        try {

            const grupoDeCaptura = await this.prismaWrite.ps_pickup_groups.create({
                data: {
                    name: dto.nome,
                    asterisk_id: this.generateAsteriskId(),
                },
            });

            if (dto.membros.length === 0) return this.mapGrupoDeCaptura(grupoDeCaptura);

            await this.prismaWrite.$transaction(async (tx) => {
                const endpointsValidos = await tx.ps_endpoints.findMany({
                    where: {
                      id: {
                        in: dto.membros,
                      },
                    },
                    select: {
                      id: true,
                    },
                  });
                  
                  const endpointIdsValidos = endpointsValidos.map(e => e.id);
                  
                  if (endpointIdsValidos.length === 0) return;
                  
                await tx.ps_pickup_group_members.createMany({
                    data: endpointIdsValidos.map(membro => ({
                        endpoint_id: membro,
                        pickup_group_id: grupoDeCaptura.id,
                    })),
                    skipDuplicates: true,
                });

                await tx.$executeRaw`
                UPDATE ps_endpoints
                SET
                  named_call_group =
                    CASE
                      WHEN array_position(
                        string_to_array(COALESCE(named_call_group, ''), ','),
                        ${grupoDeCaptura.asterisk_id}::text
                      ) IS NULL
                      THEN CONCAT_WS(',', named_call_group, ${grupoDeCaptura.asterisk_id}::text)
                      ELSE named_call_group
                    END,
                  named_pickup_group =
                    CASE
                      WHEN array_position(
                        string_to_array(COALESCE(named_pickup_group, ''), ','),
                        ${grupoDeCaptura.asterisk_id}::text
                      ) IS NULL
                      THEN CONCAT_WS(',', named_pickup_group, ${grupoDeCaptura.asterisk_id}::text)
                      ELSE named_pickup_group
                    END
                WHERE id IN (${Prisma.join(endpointIdsValidos)});
              `;
              
            });

            const grupoDeCapturaAtualizado = await this.prismaRead.ps_pickup_groups.findUnique({
                where: {
                    id: grupoDeCaptura.id,
                },
                select: {
                    id: true,
                    name: true,
                    members: {
                        select: {
                            endpoint_id: true,
                        }
                    }
                }
            });

            return this.mapGrupoDeCaptura(grupoDeCapturaAtualizado);
            
        } catch (error) {
            if (error instanceof HttpException) throw error;

            console.log(error);
            
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') throw new BadRequestException('Grupo de captura já existe');
            }

            throw new InternalServerErrorException('Erro ao criar grupo de captura');
        }
    }

    async update(id: string, dto: UpdateGrupoDeCapturaDto): Promise<UpdateGrupoDeCapturaDto> {
        try {
            const grupoDeCapturaAtualizado = await this.prismaWrite.ps_pickup_groups.update({
                where: { id },
                data: {
                    name: dto.nome,
                },
                select: {
                    id: true,
                    name: true,
                    members: {
                        select: {
                            endpoint_id: true,
                        }
                    }
                }
            });

            return this.mapGrupoDeCaptura(grupoDeCapturaAtualizado);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2007') throw new InternalServerErrorException('UUID inválido');
                if (error.code === 'P2025') throw new NotFoundException('Grupo de captura não encontrado');
            }

            throw new InternalServerErrorException('Erro ao atualizar grupo de captura');
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.prismaWrite.$transaction(async (tx) => {
                const grupoDeletado =await tx.ps_pickup_groups.delete({
                    where: { id },
                    select: {
                        asterisk_id: true,
                        members: {
                            select: {
                                endpoint_id: true,
                            }
                        }
                    }
                });
                const endpointIdsValidos = grupoDeletado.members.map(member => member.endpoint_id);

                await tx.$executeRaw`
                UPDATE ps_endpoints
                SET
                  named_call_group = array_to_string(
                    array_remove(
                      string_to_array(COALESCE(named_call_group, ''), ','),
                      ${grupoDeletado.asterisk_id}::text
                    ),
                    ','
                  ),
                  named_pickup_group = array_to_string(
                    array_remove(
                      string_to_array(COALESCE(named_pickup_group, ''), ','),
                      ${grupoDeletado.asterisk_id}::text
                    ),
                    ','
                  )
                WHERE id IN (${Prisma.join(endpointIdsValidos)});
                `;
                
            });
        } catch (error) {
            if (error instanceof HttpException) throw error;

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2007') throw new InternalServerErrorException('UUID inválido');
                if (error.code === 'P2025') throw new NotFoundException('Grupo de captura não encontrado');
            }

            throw new InternalServerErrorException('Erro ao deletar grupo de captura');
        }
    }

    async toggleMembro(dto: ToggleGrupoDeCapturaDto): Promise<void> {
        try {
          await this.prismaWrite.$transaction(async (tx) => {
            const grupo = await tx.ps_pickup_groups.findUnique({
              where: { id: dto.id },
              select: { id: true, asterisk_id: true },
            });
      
            if (!grupo) {
              throw new NotFoundException('Grupo de captura não encontrado');
            }
      
            const existente = await tx.ps_pickup_group_members.findFirst({
              where: {
                endpoint_id: dto.membroId,
                pickup_group_id: dto.id,
              },
            });
      
            if (existente) {
              await tx.ps_pickup_group_members.delete({
                where: {
                  id: existente.id,
                },
              });
      
              await tx.$executeRaw`
                UPDATE ps_endpoints
                SET
                  named_call_group = array_to_string(
                    array_remove(
                      string_to_array(COALESCE(named_call_group, ''), ','),
                      ${grupo.asterisk_id}::text
                    ),
                    ','
                  ),
                  named_pickup_group = array_to_string(
                    array_remove(
                      string_to_array(COALESCE(named_pickup_group, ''), ','),
                      ${grupo.asterisk_id}::text
                    ),
                    ','
                  )
                WHERE id = ${dto.membroId};
              `;
            } else {
              await tx.ps_pickup_group_members.create({
                data: {
                  pickup_group_id: dto.id,
                  endpoint_id: dto.membroId,
                },
              });
      
              await tx.$executeRaw`
                UPDATE ps_endpoints
                SET
                  named_call_group = CASE
                    WHEN array_position(
                      string_to_array(COALESCE(named_call_group, ''), ','),
                      ${grupo.asterisk_id}::text
                    ) IS NULL
                    THEN CONCAT_WS(',', named_call_group, ${grupo.asterisk_id}::text)
                    ELSE named_call_group
                  END,
                  named_pickup_group = CASE
                    WHEN array_position(
                      string_to_array(COALESCE(named_pickup_group, ''), ','),
                      ${grupo.asterisk_id}::text
                    ) IS NULL
                    THEN CONCAT_WS(',', named_pickup_group, ${grupo.asterisk_id}::text)
                    ELSE named_pickup_group
                  END
                WHERE id = ${dto.membroId};
              `;
            }
          });
        } catch (error) {
          if (error instanceof HttpException) throw error;

          console.log(error);
      
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
              throw new NotFoundException('Grupo de captura ou membro não encontrado');
            }
          }
      
          throw new InternalServerErrorException('Erro ao ativar/desativar membro dogrupo de captura');
        }
      }
      

    private mapGrupoDeCaptura(grupoDeCaptura: any): ListGrupoDeCapturaDto {
        return {
            id: grupoDeCaptura.id,
            nome: grupoDeCaptura.name,
            membros: grupoDeCaptura.members.map(member => member.endpoint_id) || [],
        };
    }

    private generateAsteriskId(): string {
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const length = Math.floor(Math.random() * 3) + 6;
        let asteriskId = '';
        for (let i = 0; i < length; i++) {
            asteriskId += chars[Math.floor(Math.random() * chars.length)];
        }
        return asteriskId;
    }

}
