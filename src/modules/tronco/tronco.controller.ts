import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TroncoService } from "./tronco.service";
import { CreateTroncoDto, FindTroncoDto, ListTroncoDto, UpdateTroncoDto } from "./dto/tronco.dto";

@ApiTags('Tronco')
@Controller('tronco')
export class TroncoController {
    constructor(private readonly troncoService: TroncoService) {}

    @Get()
    @ApiOperation({ summary: 'Listar todos os troncos' })
    @ApiResponse({ status: 200, description: 'Troncos listados com sucesso', type: ListTroncoDto, isArray: true })
    @ApiResponse({ status: 500, description: 'Erro ao listar troncos' })
    async list(): Promise<ListTroncoDto[]> {
        return await this.troncoService.list();
    }

    @Get(':tronco')
    @ApiOperation({ summary: 'Buscar um tronco' })
    @ApiResponse({ status: 200, description: 'Tronco encontrado com sucesso', type: FindTroncoDto })
    @ApiResponse({ status: 404, description: 'Tronco não encontrado' })
    @ApiResponse({ status: 500, description: 'Erro ao buscar tronco' })
    async find(
        @Param('tronco') tronco: string
    ): Promise<FindTroncoDto> {
        return await this.troncoService.find(tronco);
    }

    @Post()
    @ApiOperation({ summary: 'Criar um tronco' })
    @ApiResponse({ status: 201, description: 'Tronco criado com sucesso', type: CreateTroncoDto })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    @ApiResponse({ status: 500, description: 'Erro ao criar tronco' })
    async create(
        @Body() troncoDto: CreateTroncoDto
    ): Promise<CreateTroncoDto> {
        return await this.troncoService.create(troncoDto);
    }

    @Put(':tronco')
    @ApiOperation({ summary: 'Atualizar um tronco' })
    @ApiResponse({ status: 201, description: 'Tronco atualizado com sucesso', type: UpdateTroncoDto })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    @ApiResponse({ status: 404, description: 'Tronco não encontrado' })
    @ApiResponse({ status: 500, description: 'Erro ao atualizar tronco' })
    async update(
        @Param('tronco') tronco: string, 
        @Body() troncoDto: UpdateTroncoDto
    ): Promise<UpdateTroncoDto> {
        return await this.troncoService.update(tronco, troncoDto);
    }

    @Delete(':tronco')
    @ApiOperation({ summary: 'Deletar um tronco' })
    @ApiResponse({ status: 200, description: 'Tronco deletado com sucesso' })
    @ApiResponse({ status: 404, description: 'Tronco não encontrado' })
    @ApiResponse({ status: 500, description: 'Erro ao deletar tronco' })
    async delete(
        @Param('tronco') tronco: string
    ): Promise<void> {
        return await this.troncoService.delete(tronco);
    }
}
