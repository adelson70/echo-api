import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UsuarioService } from "./usuario.service";
import { AddPermissaoUsuarioDto, CreateUsuarioDto, FindUsuarioDto, ListUsuarioDto, UpdateUsuarioDto } from "./dto/usuario.dto";
import { Usuario, type UsuarioPayload } from "src/common/decorators/usuario.decorator";
import { Modulos } from "@prisma/client";
import { UuidPipe } from "src/common/pipes/uuid.pipe";

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
        @Param('id', new UuidPipe()) id: string,
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
        @Body() dto: CreateUsuarioDto,
        @Usuario() usuario: UsuarioPayload,
    ): Promise<CreateUsuarioDto> {
        return await this.usuarioService.create(dto, usuario);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar um usuário' })
    @ApiResponse({
        status: 200,
        description: 'Usuário atualizado com sucesso',
        type: UpdateUsuarioDto,
    })
    async update(
        @Param('id', new UuidPipe()) id: string, 
        @Body() dto: UpdateUsuarioDto, 
        @Usuario() usuario: UsuarioPayload): Promise<UpdateUsuarioDto> {
        return await this.usuarioService.update(id, dto, usuario);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Deletar um usuário' })
    @ApiResponse({
        status: 200,
        description: 'Usuário deletado com sucesso',
    })
    async delete(
        @Param('id', new UuidPipe()) id: string, 
        @Usuario() usuario: UsuarioPayload): Promise<void> {
        return await this.usuarioService.delete(id, usuario);
    }

    @Post('permissao/toggle')
    @ApiOperation({ summary: 'Adicionar ou Atualizar permissão de um usuário' })
    @ApiBody({
        type: AddPermissaoUsuarioDto,
    })
    @ApiResponse({
        status: 201,
        description: 'Permissões atualizadas com sucesso',
        type: AddPermissaoUsuarioDto,
        example: [{ modulo: Modulos.USUARIO, criar: true, ler: true, editar: true, deletar: true }],
    })
    async addPermissao(
        @Body() dto: AddPermissaoUsuarioDto
    ): Promise<void> {
        return await this.usuarioService.togglePermissao(dto);
    }

}
