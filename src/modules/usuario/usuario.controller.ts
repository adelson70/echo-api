import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UsuarioService } from "./usuario.service";
import { ListUsuarioDto } from "./dto/usuario.dto";
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
}
