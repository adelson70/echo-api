import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FilaService } from "./fila.service";
import { CreateFilaDto, FindFilaDto, ListFilaDto, UpdateFilaDto } from "./dto/fila.dto";
import { ToggleMemberDto } from "../ramal/dto/ramal.dto";

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
        @Param('id', new ParseUUIDPipe()) id: string
    ): Promise<FindFilaDto> {
        return await this.filaService.find(id);
    }

    @Post('create')
    @ApiOperation({ summary: 'Criar uma nova fila' })
    @ApiResponse({
        status: 201,
        description: 'Fila criada com sucesso.',
        type: CreateFilaDto,
    })
    async create(
        @Body() dto: CreateFilaDto
    ): Promise<CreateFilaDto> {
        return await this.filaService.create(dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Deletar uma fila' })
    @ApiResponse({
        status: 200,
        description: 'Fila deletada com sucesso.',
    })
    async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        return await this.filaService.delete(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar uma fila' })
    @ApiResponse({
        status: 200,
        description: 'Fila atualizada com sucesso.',
        type: UpdateFilaDto,
    })
    async update(
        @Param('id', new ParseUUIDPipe()) id: string, 
        @Body() dto: UpdateFilaDto
    ): Promise<UpdateFilaDto> {
        return await this.filaService.update(id, dto);
    }

    @Put(':id/member')
    @ApiOperation({ summary: 'Adicionar/remover um membro à fila' })
    @ApiResponse({
        status: 200,
        description: 'Membro adicionado/removido com sucesso.',
    })
    async addMember(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: ToggleMemberDto
    ): Promise<{ message: string }> {
       
        const result = await this.filaService.toggleMember(id, dto);
       
        return { message: result ? `Membro ${dto.ramal} adicionado à fila` : `Membro ${dto.ramal} removido da fila` };
    }
}
