import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaReadService } from "src/infra/database/prisma/prisma-read.service";
import { PrismaWriteService } from "src/infra/database/prisma/prisma-write.service";
import { CreateLoteRamalDto, CreateRamalDto, FindRamalDto, ListRamalDto, RamalDto, UpdateRamalDto } from "./dto/ramal.dto";
import { PasswordService } from "src/common/services/password.service";

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
                select: {
                    id: true,
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
                    id: ramal
                },
                select: {
                    id: true,
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

            if (!ramalEncontrado) throw new NotFoundException(`Ramal ${ramal} não encontrado`);
    
            return this.mapRamal(ramalEncontrado);
            
        } catch (error) {
            
            if (error instanceof HttpException) throw error;

            throw new InternalServerErrorException('Erro na busca de ramal');
        }
    }

    async create(ramalDto: CreateRamalDto): Promise<CreateRamalDto> {
        try {

            const ramalExiste = await this.prismaRead.ps_endpoints.findFirst({
                where: {
                    id: ramalDto.ramal
                }
            })

            if (ramalExiste) throw new BadRequestException(`Ramal ${ramalDto.ramal} já existe`);

            await this.prismaWrite.$transaction(async (tx) => {
                await tx.ps_endpoints.create({
                    data: {
                        id: ramalDto.ramal,
                        context: ramalDto.regraSaida,
                        set_var: `dod=${ramalDto.dod}`,
                        transport: process.env.TRANSPORT,
                        aors: ramalDto.ramal,
                        auth: ramalDto.ramal,
                        disallow: 'all',
                        allow: 'ulaw,alaw',
                        callerid: ramalDto.ramal,
                        direct_media: 'no',
                        force_rport: 'yes',
                        rtp_symmetric: 'yes',
                        aorsRelation: {
                            create: {
                                max_contacts: ramalDto.maximoContatos
                            }
                        },
                        authsRelation: {
                            create: {
                                username: ramalDto.ramal,
                                password: ramalDto.senha, 
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

            throw new InternalServerErrorException('Erro na criação de ramal');
        }

        return ramalDto
    }

    async createLote(loteRamalDto: CreateLoteRamalDto): Promise<ListRamalDto[]> {
        try {
            const { quantidadeRamais, ramalInicial } = loteRamalDto;
            const data = {
                // novosRamais
            };


        } catch (error) {
            if (error instanceof HttpException) throw error;

            throw new InternalServerErrorException('Erro na criação de lote de ramais');
        }

        return [];
    }

    async update(ramal: string, ramalDto: UpdateRamalDto): Promise<UpdateRamalDto> {
        try {
            if (Object.keys(ramalDto).length === 0) throw new BadRequestException('Nenhum dado para atualizar');
            
            const ramalExiste = await this.prismaRead.ps_endpoints.findFirst({
                where: { id: ramal },
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
            })

            if (!ramalExiste) throw new NotFoundException(`Ramal ${ramal} não encontrado`);
            
            let setVar = ramalExiste.set_var || '';
            if (setVar?.includes('dod=')) {
                setVar = setVar.replace(`dod=${this.getDod(setVar)}`, `dod=${ramalDto.dod}`);
            }

            const data = {
                set_var: setVar,
                context: ramalDto.regraSaida || ramalExiste.context,
                authsRelation: {
                    password: ramalDto.senha || ramalExiste.authsRelation!.password,
                },
                aorsRelation: {
                    max_contacts: ramalDto.maximoContatos || ramalExiste.aorsRelation!.max_contacts,
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
            const ramalExiste = await this.prismaRead.ps_endpoints.findFirst({
                where: {
                    id: ramal
                }
            })

            if (!ramalExiste) throw new NotFoundException(`Ramal ${ramal} não encontrado`);

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
                    console.log(error);
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