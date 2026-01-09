import { Controller, Get, Param } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RamalService } from "./ramal.service";
import { FindRamalDto, ListRamalDto } from "./dto/ramal.dto";

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

    @Get(':usuario')
    @ApiOperation({ summary: 'Buscar um ramal pelo usuário' })
    @ApiResponse({
        status: 200,
        description: 'Ramal encontrado',
        type: FindRamalDto,
    })
    async find(@Param('usuario') usuario: string): Promise<FindRamalDto> {
        return this.ramalService.find(usuario);
    }
}