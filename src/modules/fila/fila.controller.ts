import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FilaService } from "./fila.service";

@ApiTags('Fila')
@Controller('fila')
export class FilaController {
    constructor(private readonly filaService: FilaService) {}

    @Get()
    retorna(){
        return 'fila ok';
    }
}
