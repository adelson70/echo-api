import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PerfilService } from "./perfil.service";
import { ListPerfilDto } from "./dto/perfil.dto";

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
}
