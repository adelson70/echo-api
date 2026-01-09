import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RamalService } from "./ramal.service";
import { CreateRamalDto, FindRamalDto, ListRamalDto } from "./dto/ramal.dto";

@ApiTags('Ramal')
@Controller('ramal')
export class RamalController {
    constructor(private readonly ramalService: RamalService) {}

    @Get()
    @ApiOperation({ summary: 'Listar todos os ramais' })
    @ApiResponse({
        status: 200,
        description: 'Ramal listado com sucesso',
        type: ListRamalDto,
    })
    async list(): Promise<ListRamalDto[]> {
        return await this.ramalService.list();
    }

    @Get(':usuario')
    @ApiOperation({ summary: 'Buscar um ramal pelo usuário' })
    @ApiResponse({
        status: 200,
        description: 'Ramal encontrado com sucesso',
        type: FindRamalDto,
    })
    async find(@Param('usuario') usuario: string): Promise<FindRamalDto> {
        return await this.ramalService.find(usuario);
    }

    @Post()
    @ApiOperation({ summary: 'Criar um novo ramal' })
    @ApiResponse({
        status: 201,
        description: 'Ramal criado com sucesso.',
        type: CreateRamalDto,
    })
    async create(@Body() ramalDto: CreateRamalDto): Promise<CreateRamalDto> {
        return await this.ramalService.create(ramalDto);
    }
}