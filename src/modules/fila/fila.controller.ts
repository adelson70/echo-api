import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FilaService } from "./fila.service";
import { CreateFilaDto, FindFilaDto, ListFilaDto, UpdateFilaDto } from "./dto/fila.dto";

@ApiTags('Fila')
@Controller('fila')
export class FilaController {
    constructor(private readonly filaService: FilaService) { }

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

    @Get(':id')
    @ApiOperation({ summary: 'Buscar uma fila' })
    @ApiResponse({
        status: 200,
        description: 'Fila encontrada com sucesso.',
        type: FindFilaDto,
    })
    async find(
        @Param('id') filaId: string
    ): Promise<FindFilaDto> {
        return await this.filaService.find(filaId);
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

    @Delete(':id')
    @ApiOperation({ summary: 'Deletar uma fila' })
    @ApiResponse({
        status: 200,
        description: 'Fila deletada com sucesso.',
    })
    async delete(@Param('id') filaId: string): Promise<void> {
        return await this.filaService.delete(filaId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar uma fila' })
    @ApiResponse({
        status: 200,
        description: 'Fila atualizada com sucesso.',
        type: UpdateFilaDto,
    })
    async update(
        @Param('id') filaId: string, 
        @Body() updateFilaDto: UpdateFilaDto
    ): Promise<UpdateFilaDto> {
        return await this.filaService.update(filaId, updateFilaDto);
    }
}
