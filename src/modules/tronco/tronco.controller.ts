import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TroncoService } from "./tronco.service";

@ApiTags('Tronco')
@Controller()
export class TroncoController {
    constructor(private readonly troncoService: TroncoService) {}

    @Get()
    retorna(){
        return 'tronco ok';
    }
}