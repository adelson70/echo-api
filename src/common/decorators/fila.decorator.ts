import { Matches, ValidationOptions } from 'class-validator';

export const NomeIdentificadorFilaValidator = (validationOptions?: ValidationOptions) =>
  Matches(
    /^[a-zA-Z][a-zA-Z0-9_-]+$/,
    {
      message: 'O nome identificador da fila deve conter apenas letras, números, hífens e underscores e deve começar com uma letra',
      ...validationOptions,
    }
  );