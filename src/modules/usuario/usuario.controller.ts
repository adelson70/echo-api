import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UsuarioService } from "./usuario.service";
import { CreateUsuarioDto, FindUsuarioDto, ListUsuarioDto } from "./dto/usuario.dto";
import { Usuario, type UsuarioPayload } from "src/common/decorators/usuario.decorator";

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
}
