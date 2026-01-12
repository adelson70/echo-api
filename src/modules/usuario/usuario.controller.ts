import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UsuarioService } from "./usuario.service";
import { FindUsuarioDto, ListUsuarioDto } from "./dto/usuario.dto";
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
}
