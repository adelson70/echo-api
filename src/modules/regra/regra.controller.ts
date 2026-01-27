import { Controller, Delete, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RegraService } from "./regra.service";
import { ListRegraDto, RegraCompletoDto } from "./dto/regra.dto";
import { context_values } from "@prisma/client";

@ApiTags('Regra')
@Controller('regra')
export class RegraController {
    constructor(private readonly regraService: RegraService) {}

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
    async find(@Param('id') id: string): Promise<RegraCompletoDto> {
        return await this.regraService.find(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Deletar uma regra' })
    @ApiResponse({ status: 200, description: 'Regra deletada com sucesso' })
    @ApiResponse({ status: 404, description: 'Regra não encontrada' })
    @ApiResponse({ status: 500, description: 'Erro ao deletar regra' })
    async delete(@Param('id') id: string): Promise<void> {
        return await this.regraService.delete(id);
    }
}