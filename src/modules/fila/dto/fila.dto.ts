import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber } from "class-validator";
import { ApiProperty, PickType } from "@nestjs/swagger";
import { NomeIdentificadorFilaValidator } from "src/common/decorators/fila.decorator";

export enum EstrategiaFila {
    RING_ALL = 'ringall',
    LEAST_RECENT = 'leastrecent',
    FEWEST_CALLS = 'fewestcalls',
    RANDOM = 'random',
    RR_MEMORY = 'rrmemory',
    LINEAR = 'linear',
    WRANDOM = 'wrandom',
    RR_ORDERED = 'rrordered',
}

export enum MusicaDeEsperaFila {
    DEFAULT = 'default',
    NO_MUSIC_WHEN_EMPTY = 'no-music-when-empty',
    MUSIC_ON_HOLD = 'music-on-hold',
}

export class FilaDto {
    @IsString()
    @IsNotEmpty()
    @NomeIdentificadorFilaValidator()
    @ApiProperty({
        description: 'Nome identificador da fila',
        example: 'fila1',
    })
    nomeIdentificador: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Nome da fila',
        example: 'Fila 1',
    })
    nome: string;

    @IsEnum(EstrategiaFila)
    @IsNotEmpty()
    @ApiProperty({
        description: 'Estrategia da fila',
        example: EstrategiaFila.RING_ALL,
    })
    estrategia: EstrategiaFila;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Tempo de espera da fila',
        example: 10,
    })
    tempoEspera: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Tentativas de atendimento da fila',
        example: 10,
    })
    tentativas: number;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'Música de espera da fila',
        example: MusicaDeEsperaFila.DEFAULT,
    })
    musicaDeEspera: MusicaDeEsperaFila;
}

export class ListFilaDto extends FilaDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Ramais da fila',
        example: ['1001', '1002', '1003'],
    })
    ramais: string[];
}

export class CreateFilaDto extends FilaDto {}
export class UpdateFilaDto extends FilaDto {}
export class FindFilaDto extends PickType(FilaDto, ['nomeIdentificador']) {}
export class DeleteFilaDto extends PickType(FilaDto, ['nomeIdentificador']) {}