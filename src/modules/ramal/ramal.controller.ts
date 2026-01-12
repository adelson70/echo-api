import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RamalService } from "./ramal.service";
import { CreateLoteRamalDto, CreateRamalDto, FindRamalDto, ListRamalDto, UpdateRamalDto } from "./dto/ramal.dto";

@ApiTags('Ramal')
@Controller('ramal')
export class RamalController {
    constructor(private readonly ramalService: RamalService) {}

    @Get()
    @ApiOperation({ summary: 'Listar todos os ramais' })
    @ApiResponse({
        status: 200,
        description: 'Ramal listado com sucesso',
        type: ListRamalDto,
    })
    async list(): Promise<ListRamalDto[]> {
        return await this.ramalService.list();
    }

    @Get(':ramal')
    @ApiOperation({ summary: 'Buscar um ramal' })
    @ApiResponse({
        status: 200,
        description: 'Ramal encontrado com sucesso',
        type: FindRamalDto,
    })
    async find(@Param('ramal') ramal: string): Promise<FindRamalDto> {
        return await this.ramalService.find(ramal);
    }

    @Post('create')
    @ApiOperation({ summary: 'Criar um novo ramal' })
    @ApiResponse({
        status: 201,
        description: 'Ramal criado com sucesso.',
        type: CreateRamalDto,
    })
    async create(@Body() ramalDto: CreateRamalDto): Promise<CreateRamalDto> {
        return await this.ramalService.create(ramalDto);
    }

    @Post('create-lote')
    @ApiOperation({ summary: 'Criar um lote de ramais' })
    @ApiResponse({
        status: 201,
        description: 'Lote de ramais criado com sucesso.',
        type: ListRamalDto,
    })
    async createLote(@Body() loteRamalDto: CreateLoteRamalDto): Promise<ListRamalDto[]> {
        return await this.ramalService.createLote(loteRamalDto);
    }

    @Delete(':ramal')
    @ApiOperation({ summary: 'Deletar um ramal' })
    @ApiResponse({
        status: 200,
        description: 'Ramal deletado com sucesso.',
    })
    async delete(@Param('ramal') ramal: string): Promise<void> {
        return await this.ramalService.delete(ramal);
    }

    @Put(':ramal')
    @ApiOperation({ summary: 'Editar um ramal' })
    @ApiResponse({
        status: 200,
        description: 'Ramal editado com sucesso.',
        type: UpdateRamalDto,
    })
    async update(@Param('ramal') ramal: string, @Body() ramalDto: UpdateRamalDto): Promise<UpdateRamalDto> {
        return await this.ramalService.update(ramal, ramalDto);
    }


}