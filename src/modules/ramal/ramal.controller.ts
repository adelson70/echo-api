import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RamalService } from "./ramal.service";
import { ListRamalDto } from "./dto/ramal.dto";

@ApiTags('Ramal')
@Controller('ramal')
export class RamalController {
    constructor(private readonly ramalService: RamalService) {}

    @Get()
    @ApiOperation({ summary: 'Listar todos os ramais' })
    @ApiResponse({
        status: 200,
        description: 'Lista de ramais',
        type: ListRamalDto,
    })
    async list(): Promise<ListRamalDto[]> {
        return this.ramalService.list();
    }
}