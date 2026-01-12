import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FilaService } from "./fila.service";
import { CreateFilaDto, FindFilaDto, ListFilaDto } from "./dto/fila.dto";

@ApiTags('Fila')
@Controller('fila')
export class FilaController {
    constructor(private readonly filaService: FilaService) {}

    @Get()
    @ApiOperation({ summary: 'Listar todas as filas' })
    @ApiResponse({
        status: 200,
        description: 'Filas listadas com sucesso.',
        type: ListFilaDto,
    })
    async list(): Promise<ListFilaDto[]> {
        return await this.filaService.list();
    }

    @Get(':fila')
    @ApiOperation({ summary: 'Buscar uma fila' })
    @ApiResponse({
        status: 200,
        description: 'Fila encontrada com sucesso.',
        type: FindFilaDto,
    })
    async find(
        @Param('fila') fila: string
    ): Promise<FindFilaDto> {
        return await this.filaService.find(fila);
    }

    @Post('create')
    @ApiOperation({ summary: 'Criar uma nova fila' })
    @ApiResponse({
        status: 201,
        description: 'Fila criada com sucesso.',
        type: CreateFilaDto,
    })
    async create(
        @Body() createFilaDto: CreateFilaDto
    ): Promise<CreateFilaDto> {
        return await this.filaService.create(createFilaDto);
    }
}
