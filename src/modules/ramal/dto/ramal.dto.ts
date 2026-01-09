import { IsString, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { ApiProperty, PickType } from "@nestjs/swagger";

export class CreateRamalDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Usuário do ramal',
        example: '1001',
    })
    usuario: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Senha do ramal',
        example: '123456',
    })
    senha: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Regra de saída do ramal',
        example: 'externo',
    })
    regraSaida: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Máximo de contatos do ramal',
        example: 10,
    })
    maximoContatos: number;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'DOD do ramal',
        example: '55999999999',
    })
    dod: string;
}
export class UpdateRamalDto extends CreateRamalDto {}

export class DeleteRamalDto extends PickType(CreateRamalDto, ['usuario']) {}

export class FindRamalDto extends PickType(CreateRamalDto, ['usuario']) {}

export class ListRamalDto extends PickType(CreateRamalDto, ['usuario']) {}