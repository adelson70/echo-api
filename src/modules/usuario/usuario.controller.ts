import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UsuarioService } from "./usuario.service";
import { AddPermissaoDto, CreateUsuarioDto, FindUsuarioDto, ListUsuarioDto, UpdateUsuarioDto } from "./dto/usuario.dto";
import { Usuario, type UsuarioPayload } from "src/common/decorators/usuario.decorator";
import { Modulos } from "@prisma/client";

@ApiTags('Usuario')
@Controller('usuario')
export class UsuarioController {
    constructor(private readonly usuarioService: UsuarioService) {}

    @Get()
    @ApiOperation({ summary: 'Listar todos os usuários' })
    @ApiResponse({
        status: 200,
        description: 'Usuários listados com sucesso',
        type: ListUsuarioDto,
    })
    async list(
        @Usuario() usuario: UsuarioPayload,
    ): Promise<ListUsuarioDto[]> {
        return await this.usuarioService.list(usuario);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar um usuário' })
    @ApiResponse({
        status: 200,
        description: 'Usuário encontrado com sucesso',
        type: FindUsuarioDto,
    })
    async find(
        @Param('id') id: string,
        @Usuario() usuario: UsuarioPayload,
    ): Promise<FindUsuarioDto> {
        return await this.usuarioService.find(id, usuario);
    }

    @Post('create')
    @ApiOperation({ summary: 'Criar um novo usuário' })
    @ApiResponse({
        status: 201,
        description: 'Usuário criado com sucesso',
        type: CreateUsuarioDto,
    })
    async create(
        @Body() createUsuarioDto: CreateUsuarioDto,
        @Usuario() usuario: UsuarioPayload,
    ): Promise<CreateUsuarioDto> {
        return await this.usuarioService.create(createUsuarioDto, usuario);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar um usuário' })
    @ApiResponse({
        status: 200,
        description: 'Usuário atualizado com sucesso',
        type: UpdateUsuarioDto,
    })
    async update(
        @Param('id') id: string, 
        @Body() updateUsuarioDto: UpdateUsuarioDto, 
        @Usuario() usuario: UsuarioPayload): Promise<UpdateUsuarioDto> {
        return await this.usuarioService.update(id, updateUsuarioDto, usuario);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Deletar um usuário' })
    @ApiResponse({
        status: 200,
        description: 'Usuário deletado com sucesso',
    })
    async delete(
        @Param('id') id: string, 
        @Usuario() usuario: UsuarioPayload): Promise<void> {
        return await this.usuarioService.delete(id, usuario);
    }

    @Post('permissao/toggle')
    @ApiOperation({ summary: 'Adicionar ou Atualizar permissão de um usuário' })
    @ApiBody({
        type: AddPermissaoDto,
    })
    @ApiResponse({
        status: 201,
        description: 'Permissões atualizadas com sucesso',
        type: AddPermissaoDto,
        example: [{ modulo: Modulos.USUARIO, criar: true, ler: true, editar: true, deletar: true }],
    })
    async addPermissao(
        @Body() addPermissaoDto: AddPermissaoDto): Promise<void> {
        return await this.usuarioService.togglePermissao(addPermissaoDto);
    }

}
