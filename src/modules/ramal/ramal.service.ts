import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/infra/database/prisma/prisma.service";
import { ListRamalDto } from "./dto/ramal.dto";

@Injectable()
export class RamalService {
    constructor(private readonly prisma: PrismaService) {}

    async list(): Promise<ListRamalDto[]> {
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

        return ramais.map(ramal => ({
            usuario: ramal.id,
            senha: ramal!.authsRelation!.password,
            regraSaida: ramal!.context!,
            maximoContatos: ramal!.aorsRelation!.max_contacts,
            dod: (() => {
                const setVar = ramal.set_var;
                if (!setVar) return null;
                const setVarArray = setVar.split(';');
                const dod = setVarArray.find(item => item.startsWith('dod='));
                return dod ? dod.split('=')[1] : null;
            })()
        }));

    }
}