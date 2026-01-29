import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaReadService } from "src/infra/database/prisma/prisma-read.service";
import { PrismaWriteService } from "src/infra/database/prisma/prisma-write.service";
import { CreateLoteRamalDto, CreateRamalDto, FindRamalDto, ListRamalDto, RamalDto, UpdateRamalDto } from "./dto/ramal.dto";
import { PasswordService } from "src/common/services/password.service";
import { Prisma, tipo_endpoint_values } from "@prisma/client";

@Injectable()
export class RamalService {
    constructor(
        private readonly prismaRead: PrismaReadService, 
        private readonly prismaWrite: PrismaWriteService,
        private readonly passwordService: PasswordService
    ) 
    {}

    async list(): Promise<ListRamalDto[]> {
        try {
            const ramais = await this.prismaRead.ps_endpoints.findMany({
                where: {
                    tipo_endpoint: tipo_endpoint_values.ramal
                },
                select: {
                    id: true,
                    displayname: true,
                    context: true,
                    set_var: true,
                    authsRelation: {
                        select: {
                            username: true,
                            password: true,
                        }
                    },
                    aorsRelation: {
                        select: {
                            max_contacts: true,
                        }
                    },
                }
            })

            if (!ramais) throw new NotFoundException('Nenhum ramal encontrado');
    
            return this.mapRamalList(ramais);
            
        } catch (error) {
            
            if (error instanceof HttpException) throw error;

            throw new InternalServerErrorException('Erro na listagem de ramais');
        }

    }

    async find(ramal: string): Promise<FindRamalDto> {
        try {
            const ramalEncontrado = await this.prismaRead.ps_endpoints.findFirst({
                where: {
                    id: ramal,
                    tipo_endpoint: tipo_endpoint_values.ramal
                },
                select: {
                    id: true,
                    displayname: true,
                    context: true,
                    set_var: true,
                    authsRelation: {
                        select: {
                            username: true,
                            password: true,
                        }
                    },
                    aorsRelation: {
                        select: {
                            max_contacts: true,
                        }
                    },
                }
            })

            return this.mapRamal(ramalEncontrado);
            
        } catch (error) {
            
            if (error instanceof HttpException) throw error;

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') throw new NotFoundException('Ramal não encontrado');
            }

            throw new InternalServerErrorException('Erro na busca de ramal');
        }
    }

    async create(dto: CreateRamalDto): Promise<CreateRamalDto> {
        try {
            await this.prismaWrite.$transaction(async (tx) => {
                await tx.ps_endpoints.create({
                    data: {
                        id: dto.ramal,
                        displayname: dto.nome || dto.ramal,
                        context: dto.regraSaida,
                        set_var: `dod=${dto.dod}`,
                        transport: process.env.TRANSPORT,
                        aors: dto.ramal,
                        auth: dto.ramal,
                        disallow: 'all',
                        allow: 'ulaw,alaw',
                        callerid: dto.ramal,
                        direct_media: 'no',
                        force_rport: 'yes',
                        rtp_symmetric: 'yes',
                        tipo_endpoint: tipo_endpoint_values.ramal,
                        aorsRelation: {
                            create: {
                                max_contacts: dto.maximoContatos
                            }
                        },
                        authsRelation: {
                            create: {
                                username: dto.ramal,
                                password: dto.senha, 
                                auth_type: 'userpass'
                            }
                        }
                    }
                }).catch(() => {
                    throw new InternalServerErrorException('Erro na criação de ramal');
                });
            })
            
        } catch (error) {
            if (error instanceof HttpException) throw error;

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') throw new BadRequestException('Ramal já existe');
            }

            throw new InternalServerErrorException('Erro na criação de ramal');
        }

        return dto
    }

    // RAMAIS QUE EXISTEM SERAO IGNORADOS
    async createLote(dto: CreateLoteRamalDto): Promise<ListRamalDto[]> {
        try {
            const { ramalInicial, quantidadeRamais } = dto;
            const data: { ramaisNovos: string[], ramaisExistentes: string[] } = {
                ramaisNovos: [],
                ramaisExistentes: [],
            };
            
            const ramaisParaVerificar = Array.from({ length: quantidadeRamais }, (_, i) => `${Number(ramalInicial)+i}`);

            const ramaisExistentes = await this.prismaRead.ps_endpoints.findMany({
                where: {
                    id: {
                        in: ramaisParaVerificar
                    }
                },
                select: { id: true }
            });

            const idsExistentes = new Set(ramaisExistentes.map(r => r.id));
            data.ramaisNovos = ramaisParaVerificar.filter(id => !idsExistentes.has(id));
            data.ramaisExistentes = ramaisExistentes.map(r => r.id);

            if (data.ramaisNovos.length === 0) throw new BadRequestException('Nenhum ramal para criar, todos os ramais já existem');

            if (data.ramaisNovos.length > 0) {
                return await this.prismaWrite.$transaction(async (tx) => {
                    const novosRamais = await Promise.all(data.ramaisNovos.map(async (ramal) => {
                        return await tx.ps_endpoints.create({
                            data: {
                                id: ramal,
                                displayname: ramal,
                                context: dto.regraSaida,
                                set_var: dto.dod ? `dod=${dto.dod}` : '',
                                transport: process.env.TRANSPORT,
                                aors: ramal,
                                auth: ramal,
                                disallow: 'all',
                                allow: 'ulaw,alaw',
                                callerid: ramal,
                                direct_media: 'no',
                                force_rport: 'yes',
                                rtp_symmetric: 'yes',
                                aorsRelation: {
                                    create: {
                                        max_contacts: dto.maximoContatos
                                    }
                                },
                                authsRelation: {
                                    create: {
                                        username: ramal,
                                        password: this.passwordService.generateOne(),
                                        auth_type: 'userpass'
                                    }
                                }
                            },
                            select: {
                                id: true,
                                context: true,
                                set_var: true,
                                authsRelation: {
                                    select: {
                                        password: true,
                                    }
                                },
                                aorsRelation: {
                                    select: {
                                        max_contacts: true,
                                    }
                                }
                            }
                        });
                    }));

                    return novosRamais.map(ramal => this.mapRamal(ramal));
                });
            }

            return [];
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException('Erro na criação de lote de ramais');
        }
    }

    async update(ramal: string, dto: UpdateRamalDto): Promise<UpdateRamalDto> {
        try {
            if (Object.keys(dto).length === 0) throw new BadRequestException('Nenhum dado para atualizar');
            
            const ramalExiste = await this.prismaRead.ps_endpoints.findFirst({
                where: { id: ramal },
                select: {
                    id: true,
                    displayname: true,
                    context: true,
                    set_var: true,
                    authsRelation: {
                        select: {
                            password: true,
                        }
                    },
                    aorsRelation: {
                        select: {
                            max_contacts: true,
                        }
                    },
                }
            })

            if (!ramalExiste) throw new NotFoundException(`Ramal ${ramal} não encontrado`);
            
            let setVar = ramalExiste.set_var || '';
            if (setVar?.includes('dod=')) {
                setVar = setVar.replace(`dod=${this.getDod(setVar)}`, `dod=${dto.dod}`);
            }

            const data = {
                set_var: setVar,
                context: dto.regraSaida || ramalExiste.context,
                authsRelation: {
                    password: dto.senha || ramalExiste.authsRelation!.password,
                },
                aorsRelation: {
                    max_contacts: dto.maximoContatos || ramalExiste.aorsRelation!.max_contacts,
                },
            }

            return await this.prismaWrite.$transaction(async (tx) => {
                const ramalAtualizado = await tx.ps_endpoints.update({
                    where: {
                        id: ramal
                    },
                    data: {
                        set_var: data.set_var,
                        context: data.context,
                        authsRelation: {
                            update: { password: data.authsRelation!.password },
                        },
                        aorsRelation: {
                            update: { max_contacts: data.aorsRelation!.max_contacts },
                        },
                    },
                    select: {
                        id: true,
                        context: true,
                        set_var: true,
                        authsRelation: {
                            select: {
                                password: true,
                            }
                        },
                        aorsRelation: {
                            select: {
                                max_contacts: true,
                            }
                        },
                    }
                }).catch((error) => {
                    throw new InternalServerErrorException('Erro na atualização de ramal');
                });

                return this.mapRamal(ramalAtualizado);
            })
            
        } catch (error) {
            if (error instanceof HttpException) throw error;
            
            throw new InternalServerErrorException('Erro na atualização de ramal');
        }
    }

    async delete(ramal: string): Promise<void> {
        try {
            await this.prismaWrite.$transaction(async (tx) => {
                await tx.ps_endpoints.delete({
                    where: {
                        id: ramal
                    },
                    include: {
                        aorsRelation: true,
                        authsRelation: true,
                    }
                }).catch((error) => {
                    if (error instanceof Prisma.PrismaClientKnownRequestError) {
                        if (error.code === 'P2025') throw new NotFoundException('Ramal não encontrado');
                    }

                    throw new InternalServerErrorException('Erro na exclusão de ramal');
                });
            })
            
            
        } catch (error) {
            if (error instanceof HttpException) throw error;

            throw new InternalServerErrorException('Erro na exclusão de ramal');
        }
    }

    private getDod(setVar: string): string | null {
        if (!setVar) return null;
        const setVarArray = setVar.split(';');
        const dod = setVarArray.find(item => item.startsWith('dod='));
        return dod ? dod.split('=')[1] : null;
    }

    private mapRamal(ramal: any): RamalDto {
        return {
            ramal: ramal.id,
            nome: ramal.displayname,
            senha: ramal!.authsRelation!.password,
            regraSaida: ramal!.context!,
            maximoContatos: ramal!.aorsRelation!.max_contacts,
            dod: this.getDod(ramal.set_var),
        }
    }

    private mapRamalList(ramais: any[]): RamalDto[] {
        return ramais.map(ramal => this.mapRamal(ramal));
    }
}