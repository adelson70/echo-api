import { Matches, ValidationOptions } from 'class-validator';

export const PasswordValidator = (validationOptions?: ValidationOptions) =>
  Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&#]{8,20}$/,
    {
      message: 'A senha deve conter entre 8 e 20 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial',
      ...validationOptions,
    }
  );