import { ApiProperty, PartialType, PickType } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class TroncoDto {
    @IsString()
    @ApiProperty({
        description: 'Nome do tronco',
        example: 'tronco1',
    })
    username: string;

    @IsString()
    @ApiProperty({
        description: 'Senha do tronco',
        example: 'senha123',
    })
    password: string;
    
    @IsString()
    @ApiProperty({
        description: 'URI do cliente do tronco',
        example: 'provedor.sip.com',
    })
    provedorHost: string;
}

export class ListTroncoDto extends TroncoDto {}
export class FindTroncoDto extends TroncoDto {}

export class CreateTroncoDto extends TroncoDto {
    @IsNotEmpty()
    declare username: string;

    @IsNotEmpty()
    declare password: string;

    @IsNotEmpty()
    declare provedorHost: string;
}

export class UpdateTroncoDto extends PartialType(TroncoDto) {
    @IsOptional()
    declare username: string;

    @IsOptional()
    declare password: string;

    @IsOptional()
    declare provedorHost: string;
}