import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SaidaService } from "./saida.service";

@ApiTags('Regra de Saída')
@Controller()
export class SaidaController {
    constructor(private readonly saidaService: SaidaService) {}

    @Get()
    retorna(){
        return 'saida ok';
    }   
}