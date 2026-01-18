import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PerfilService } from "./perfil.service";
import { AddPermissaoDto, CreatePerfilDto, FindPerfilDto, ListPerfilDto, UpdatePerfilDto } from "./dto/perfil.dto";

@ApiTags('Perfil')
@Controller('perfil')
export class PerfilController {
    constructor(private readonly perfilService: PerfilService) {}

    @Get()
    @ApiOperation({ summary: 'Listar todos os perfis' })
    @ApiResponse({
        status: 200,
        description: 'Perfis listados com sucesso',
        type: ListPerfilDto,
    })
    async list(): Promise<ListPerfilDto[]> {
        return await this.perfilService.list();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar um perfil' })
    @ApiResponse({
        status: 200,
        description: 'Perfil encontrado com sucesso',
        type: FindPerfilDto,
    })
    async find(@Param('id') id: string): Promise<FindPerfilDto> {
        return await this.perfilService.find(id);
    }

    @Post('create')
    @ApiOperation({ summary: 'Criar um novo perfil' })
    @ApiResponse({
        status: 201,
        description: 'Perfil criado com sucesso',
        type: CreatePerfilDto,
    })
    async create(@Body() createPerfilDto: CreatePerfilDto): Promise<CreatePerfilDto> {
        return await this.perfilService.create(createPerfilDto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar um perfil' })
    @ApiResponse({
        status: 200,
        description: 'Perfil atualizado com sucesso',
        type: UpdatePerfilDto,
    })
    async update(@Param('id') id: string, @Body() updatePerfilDto: UpdatePerfilDto): Promise<UpdatePerfilDto> {
        return await this.perfilService.update(id, updatePerfilDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Deletar um perfil' })
    @ApiResponse({
        status: 200,
        description: 'Perfil deletado com sucesso',
    })
    async delete(@Param('id') id: string): Promise<void> {
        return await this.perfilService.delete(id);
    }

    @Post('permissao/toggle')
    @ApiOperation({ summary: 'Adicionar ou Atualizar permissão de um perfil' })
    @ApiBody({
        type: AddPermissaoDto,
    })
    @ApiResponse({
        status: 201,
        description: 'Permissões atualizadas com sucesso',
    })
    async addPermissao(@Body() addPermissaoDto: AddPermissaoDto): Promise<void> {
        return await this.perfilService.togglePermissao(addPermissaoDto);
    }
}
