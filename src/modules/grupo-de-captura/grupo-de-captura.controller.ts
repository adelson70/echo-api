import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GrupoDeCapturaService } from "./grupo-de-captura.service";
import { CreateGrupoDeCapturaDto, FindGrupoDeCapturaDto, ListGrupoDeCapturaDto, ToggleGrupoDeCapturaDto, UpdateGrupoDeCapturaDto } from "./dto/grupo-de-captura.dto";

@ApiTags('GrupoDeCaptura')
@Controller('grupo-de-captura')
export class GrupoDeCapturaController {
    constructor(private readonly grupoDeCapturaService: GrupoDeCapturaService) {}

    @Get()
    @ApiOperation({ summary: 'Listar todos os grupos de captura' })
    @ApiResponse({ status: 200, description: 'Grupos de captura listados com sucesso', type: ListGrupoDeCapturaDto, isArray: true })
    async list(): Promise<ListGrupoDeCapturaDto[]> {
        return await this.grupoDeCapturaService.list();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar um grupo de captura' })
    @ApiResponse({ status: 200, description: 'Grupo de captura encontrado com sucesso', type: FindGrupoDeCapturaDto,
    })
    async find(
        @Param('id', new ParseUUIDPipe()) id: string
    ): Promise<FindGrupoDeCapturaDto> {
        return await this.grupoDeCapturaService.find(id);
    }

    @Post()
    @ApiOperation({ summary: 'Criar um grupo de captura' })
    @ApiResponse({ status: 201, description: 'Grupo de captura criado com sucesso', type: CreateGrupoDeCapturaDto,
    })
    async create(
        @Body() dto: CreateGrupoDeCapturaDto
    ): Promise<CreateGrupoDeCapturaDto> {
        return await this.grupoDeCapturaService.create(dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar um grupo de captura' })
    @ApiResponse({ status: 200, description: 'Grupo de captura atualizado com sucesso', type: UpdateGrupoDeCapturaDto,
    })
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: UpdateGrupoDeCapturaDto
    ): Promise<UpdateGrupoDeCapturaDto> {
        return await this.grupoDeCapturaService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Deletar um grupo de captura' })
    @ApiResponse({ status: 200, description: 'Grupo de captura deletado com sucesso' })
    async delete(
        @Param('id', new ParseUUIDPipe()) id: string
    ): Promise<void> {
        await this.grupoDeCapturaService.delete(id);
    }

    @Post('toggle-membro')
    @ApiOperation({ summary: 'Adicionar/Remover um membro a um grupo de captura' })
    @ApiResponse({ status: 201, description: 'Membro adicionado/removido do grupo de captura com sucesso' })
    async toggleMembro(
        @Body() dto: ToggleGrupoDeCapturaDto
    ): Promise<void> {
        await this.grupoDeCapturaService.toggleMembro(dto);
    }
}
