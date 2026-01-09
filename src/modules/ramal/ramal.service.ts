import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/infra/database/prisma/prisma.service";
import { FindRamalDto, ListRamalDto, RamalDto } from "./dto/ramal.dto";

@Injectable()
export class RamalService {
    constructor(private readonly prisma: PrismaService) {}

    async list(): Promise<ListRamalDto[]> {
        try {
            const ramais = await this.prisma.ps_endpoints.findMany({
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

    async find(usuario: string): Promise<FindRamalDto> {
        try {
            const ramal = await this.prisma.ps_endpoints.findFirst({
                where: {
                    id: usuario
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

            if (!ramal) throw new NotFoundException(`Ramal ${usuario} não encontrado`);
    
            return this.mapRamal(ramal);
            
        } catch (error) {
            
            if (error instanceof HttpException) throw error;

            throw new InternalServerErrorException('Erro na busca de ramal');
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
            usuario: ramal.id,
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