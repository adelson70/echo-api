import { SetMetadata } from "@nestjs/common";
import { Modulos } from "@prisma/client";

export const MODULO_KEY = 'modulo';

export const Modulo = (modulo: Modulos) => SetMetadata(MODULO_KEY, modulo);
