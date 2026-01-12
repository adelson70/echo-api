import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FilaService } from "./fila.service";
import { CreateFilaDto } from "./dto/fila.dto";

@ApiTags('Fila')
@Controller('fila')
export class FilaController {
    constructor(private readonly filaService: FilaService) {}

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
