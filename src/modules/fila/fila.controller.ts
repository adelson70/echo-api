import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FilaService } from "./fila.service";
import { CreateFilaDto, ListFilaDto } from "./dto/fila.dto";

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
