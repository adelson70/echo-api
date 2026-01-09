import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RegraService } from "./regra.service";

@ApiTags('Regra')
@Controller()
export class RegraController {
    constructor(private readonly regraService: RegraService) {}

    @Get('regra')
    retorna(){
        return 'regra ok';
    }
}