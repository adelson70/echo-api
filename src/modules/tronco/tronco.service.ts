import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaReadService } from "src/infra/database/prisma/prisma-read.service";
import { PrismaWriteService } from "src/infra/database/prisma/prisma-write.service";
import { CreateTroncoDto, FindTroncoDto, ListTroncoDto, TroncoDto, UpdateTroncoDto } from "./dto/tronco.dto";
import { ast_bool_values, pjsip_auth_type_values_v2, ps_auths, ps_endpoints, ps_registrations, tipo_endpoint_values } from "@prisma/client";
import { SshService } from "src/infra/ssh/ssh.service";

@Injectable()
export class TroncoService {
    constructor(
        private readonly prismaRead: PrismaReadService, 
        private readonly prismaWrite: PrismaWriteService,
        private readonly sshService: SshService,
    ) {}

    async list(): Promise<ListTroncoDto[]> {
        try {
            const troncos = await this.prismaRead.ps_endpoints.findMany({
                where: {
                    tipo_endpoint: tipo_endpoint_values.tronco
                },
                select: {
                    id: true,
                    registrationRelation: {
                        select: {
                            client_uri: true,
                        }
                    },
                    authsRelation: {
                        select: {
                            username: true,
                            password: true,
                        }
                    }
                }
            })

            if (!troncos) return [];

            return this.mapTroncoList(troncos);
            
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new InternalServerErrorException('Erro na listagem de troncos');
        }
    }

    async find(troncoId: string): Promise<FindTroncoDto> {
        try {
            const tronco = await this.prismaRead.ps_endpoints.findUnique({
                where: {
                    id: troncoId,
                },
                select: {
                    registrationRelation: {
                        select: {
                            client_uri: true,
                        }
                    },
                    authsRelation: {
                        select: {
                            username: true,
                            password: true,
                        }
                    }
                }
            })

            if (!tronco) throw new NotFoundException('Tronco não encontrado');

            return this.mapTronco(tronco);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new InternalServerErrorException('Erro na busca de tronco');
        }
    }

    async create(troncoDto: CreateTroncoDto): Promise<CreateTroncoDto> {
        try {
            const tronco = await this.prismaWrite.ps_endpoints.create({
                data: {
                    id: troncoDto.username,
                    transport: process.env.TRANSPORT,
                    aors: troncoDto.username,
                    auth: troncoDto.username,
                    context: 'from-trunk',
                    disallow: 'all',
                    allow: 'ulaw,alaw',
                    direct_media: ast_bool_values.no,
                    force_rport: ast_bool_values.yes,
                    rewrite_contact: ast_bool_values.yes,
                    rtp_symmetric: ast_bool_values.yes,
                    authsRelation: {
                        create: {
                            auth_type: pjsip_auth_type_values_v2.userpass,
                            username: troncoDto.username,
                            password: troncoDto.password,
                        }
                    },
                    aorsRelation: {
                        create: {
                            max_contacts: 1,
                            remove_existing: ast_bool_values.yes,
                        }
                    },
                    registrationRelation: {
                        create: {
                            transport: process.env.TRANSPORT,
                            server_uri: this.generateServerUri(troncoDto.provedorHost),
                            client_uri: this.generateClientUri(troncoDto.username, troncoDto.provedorHost),
                            retry_interval: 60,
                            expiration: 3600,
                            support_path: ast_bool_values.yes,
                        }
                    },
                    tipo_endpoint: tipo_endpoint_values.tronco,
                },
                select: {
                    authsRelation: {
                        select: {
                            username: true,
                            password: true,
                        }
                    },
                    registrationRelation: {
                        select: {
                            client_uri: true,
                        }
                    },
                }
            })

            await this.createTronco(troncoDto);

            return this.mapTronco(tronco);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new InternalServerErrorException('Erro na criação de tronco');
        }
    }

    async update(troncoId: string, troncoDto: UpdateTroncoDto): Promise<UpdateTroncoDto> {
        try {
            const troncoExistente = await this.prismaRead.ps_endpoints.findUnique({
                where: {
                    id: troncoId,
                },
                select: {
                    authsRelation: {
                        select: {
                            username: true,
                            password: true,
                        }
                    },
                    registrationRelation: {
                        select: {
                            client_uri: true,
                        }
                    },
                }
            }) as ps_endpoints & { authsRelation: ps_auths; registrationRelation: ps_registrations };

            if (!troncoExistente) throw new NotFoundException('Tronco não encontrado');

            const tronco = await this.prismaWrite.ps_endpoints.update({
                where: {
                    id: troncoId,
                },
                data: {
                    id: troncoDto.username,
                    authsRelation: {
                        update: {
                            username: troncoDto.username,
                            password: troncoDto.password,
                        }
                    },
                    registrationRelation: {
                        update: {
                            server_uri: this.generateServerUri(troncoDto.provedorHost || troncoExistente.registrationRelation.client_uri!.split('@')[1]),
                            client_uri: this.generateClientUri(troncoDto.username, troncoDto.provedorHost || troncoExistente.registrationRelation.client_uri!.split('@')[1]),
                        }
                    },
                },
                select: {
                    authsRelation: {
                        select: {
                            username: true,
                            password: true,
                        }
                    },
                    registrationRelation: {
                        select: {
                            client_uri: true,
                        }
                    },
                }
            })

            await this.updateTronco(troncoId, troncoDto);

            return this.mapTronco(tronco);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new InternalServerErrorException('Erro na atualização de tronco');
        }
    }

    async delete(troncoId: string): Promise<void> {
        try {
            await this.deleteTronco(troncoId);

            const tronco = await this.prismaRead.ps_endpoints.findUnique({
                where: {
                    id: troncoId,
                },
            })

            if (!tronco) throw new NotFoundException('Tronco não encontrado');

            await this.prismaWrite.ps_endpoints.delete({
                where: {
                    id: troncoId,
                }
            })
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new InternalServerErrorException('Erro na exclusão de tronco');
        }
    }

    private mapTronco(tronco: any): TroncoDto {
        return {
            provedorHost: tronco.registrationRelation.client_uri.split('@')[1],
            username: tronco.authsRelation.username,
            password: tronco.authsRelation.password,
        }
    }

    private mapTroncoList(troncos: any[]): TroncoDto[] {
        return troncos.map(this.mapTronco);
    }

    private generateClientUri(username: string, provedorHost: string): string {
        return `sip:${username}@${provedorHost}`;
    }

    private generateServerUri(provedorHost: string): string {
        return `sip:${provedorHost}:5060`;
    }

    private async createTronco(troncoDto: CreateTroncoDto): Promise<void> {
        try {
            const comando = [
                'sudo',
                '/usr/local/bin/pjsip_trunk.sh',
                'create',
                troncoDto.username,
                troncoDto.username,
                troncoDto.password,
                this.generateServerUri(troncoDto.provedorHost),
                this.generateClientUri(troncoDto.username, troncoDto.provedorHost),
            ].join(' ');

            await this.sshService.exec(comando)
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new InternalServerErrorException('Erro ao criar tronco no Asterisk');
        }
    }

    private async updateTronco(troncoId: string, troncoDto: UpdateTroncoDto): Promise<void> {
        try {
            let comando = [
                'sudo',
                '/usr/local/bin/pjsip_trunk.sh',
                'edit',
                troncoId,
            ];

            if (troncoDto.provedorHost) {
                comando.push(`--server-uri=${this.generateServerUri(troncoDto.provedorHost)}`);
            }

            if (troncoDto.username) {
                comando.push(`--username=${troncoDto.username}`);
            }

            if (troncoDto.password) {
                comando.push(`--password=${troncoDto.password}`);
            }

            await this.sshService.exec(comando.join(' '));
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new InternalServerErrorException('Erro ao atualizar tronco no Asterisk');
        }
    }

    private async deleteTronco(troncoId: string): Promise<void> {
        try {
            const comando = [
                'sudo',
                '/usr/local/bin/pjsip_trunk.sh',
                'delete',
                troncoId,
            ].join(' ');

            await this.sshService.exec(comando);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new InternalServerErrorException('Erro ao deletar tronco no Asterisk');
        }
    }
}
