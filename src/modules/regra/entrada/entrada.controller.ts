import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { EntradaService } from "./entrada.service";

@ApiTags('Regra de Entrada')
@Controller()
export class EntradaController {
    constructor(private readonly entradaService: EntradaService) {}

    @Get()
    retorna(){
        return 'entrada ok';
    }
}