import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SistemaService } from "./sistema.service";

@ApiTags('Sistema')
@Controller('sistema')
export class SistemaController {
    constructor(private readonly sistemaService: SistemaService) {}

    @Get()
    retorna(){
        return 'sistema ok';
    }
}
