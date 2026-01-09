import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RelatorioService } from "./relatorio.service";

@ApiTags('Relatorio')
@Controller('relatorio')
export class RelatorioController {
    constructor(private readonly relatorioService: RelatorioService) {}

    @Get()
    retorna(){
        return 'relatorio ok';
    }
}
