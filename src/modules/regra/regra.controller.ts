import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RegraService } from "./regra.service";
import { CreateRegraDto, ListRegraDto, RegraCompletoDto, UpdateRegraDto } from "./dto/regra.dto";
import { context_values } from "@prisma/client";
import { UuidPipe } from "src/common/pipes/uuid.pipe";

@ApiTags('Regra')
@Controller('regra')
export class RegraController {
    constructor(
        private readonly regraService: RegraService
    ) {}

    @Get()
    @ApiQuery({ name: 'tipo', enum: context_values, required: false })
    @ApiOperation({ summary: 'Listar todas as regras' })
    @ApiResponse({
        status: 200,
        description: 'Regras listadas com sucesso',
        type: ListRegraDto,
    })
    async list(
        @Query('tipo') tipo?: context_values,
    ): Promise<ListRegraDto[]> {
        return await this.regraService.list(tipo);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar uma regra pelo ID' })
    @ApiResponse({
        status: 200,
        description: 'Regra encontrada com sucesso',
        type: RegraCompletoDto,
    })
    async find(
        @Param('id', new UuidPipe()) id: string
    ): Promise<RegraCompletoDto> {
        return await this.regraService.find(id);
    }

    @Post('create')
    @ApiOperation({ summary: 'Criar uma nova regra' })
    @ApiResponse({
        status: 201,
        description: 'Regra criada com sucesso',
        type: ListRegraDto,
    })
    async create(
        @Body() dto: CreateRegraDto
    ): Promise<ListRegraDto> {
        return await this.regraService.create(dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar uma regra existente' })
    @ApiResponse({
        status: 200,
        description: 'Regra atualizada com sucesso',
        type: ListRegraDto,
    })
    async update(
        @Param('id', new UuidPipe()) id: string,
        @Body() dto: UpdateRegraDto
    ): Promise<ListRegraDto> {
        return await this.regraService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Deletar uma regra' })
    @ApiResponse({ status: 200, description: 'Regra deletada com sucesso' })
    @ApiResponse({ status: 404, description: 'Regra não encontrada' })
    @ApiResponse({ status: 500, description: 'Erro ao deletar regra' })
    async delete(@Param('id', new UuidPipe()) id: string): Promise<void> {
        return await this.regraService.delete(id);
    }
}