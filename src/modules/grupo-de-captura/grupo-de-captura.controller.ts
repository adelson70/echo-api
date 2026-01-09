import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { GrupoDeCapturaService } from "./grupo-de-captura.service";

@ApiTags('GrupoDeCaptura')
@Controller('grupo-de-captura')
export class GrupoDeCapturaController {
    constructor(private readonly grupoDeCapturaService: GrupoDeCapturaService) {}

    @Get()
    retorna(){
        return 'grupo-de-captura ok';
    }
}
