import { ApiProperty, OmitType, PartialType, PickType } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class GrupoDeCapturaDto {
    @IsUUID()
    @ApiProperty({
        description: 'ID do grupo de captura',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @IsString()
    @ApiProperty({
        description: 'Asterisk ID do grupo de captura',
        example: '87a93F2a',
        pattern: '^[a-zA-Z0-9]{6,8}$',
    })
    asteriskId: string;

    @IsString()
    @ApiProperty({
        description: 'Nome do grupo de captura',
        example: 'Grupo de Captura 1',
    })
    nome: string;

    @IsArray()
    @ApiProperty({
        description: 'Membros do grupo de captura',
        example: ['1001', '1002', '1003'],
    })
    membros: string[];
}

export class ListGrupoDeCapturaDto extends OmitType(GrupoDeCapturaDto, ['asteriskId']) {}
export class FindGrupoDeCapturaDto extends ListGrupoDeCapturaDto {}

export class CreateGrupoDeCapturaDto extends PartialType(
    OmitType(GrupoDeCapturaDto, ['id', 'asteriskId'])
) {
    @IsNotEmpty()
    declare nome: string;

    @IsOptional()
    declare membros: string[];
}

export class UpdateGrupoDeCapturaDto extends PartialType(
    OmitType(GrupoDeCapturaDto, ['id', 'asteriskId', 'membros'])
) {
    @IsNotEmpty()
    declare nome: string;
}

export class ToggleGrupoDeCapturaDto extends PickType(GrupoDeCapturaDto, ['id']) {
    @IsNotEmpty()
    declare id: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'ID do membro do grupo de captura',
        example: '2000',
    })
    membroId: string;
}