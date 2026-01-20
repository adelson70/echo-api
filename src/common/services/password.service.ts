import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  private readonly lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  private readonly uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private readonly numberChars = '0123456789';
  private readonly specialChars = '@$!%*?&';
  private readonly allAllowedChars =
    this.lowercaseChars + this.uppercaseChars + this.numberChars + this.specialChars + '#';

  /**
   * Gera uma senha aleatória que atende aos requisitos de validação:
   * - Entre 8 e 20 caracteres
   * - Pelo menos uma letra minúscula
   * - Pelo menos uma letra maiúscula
   * - Pelo menos um número
   * - Pelo menos um caractere especial (@$!%*?&)
   * - Apenas caracteres permitidos: A-Z, a-z, 0-9, @$!%*?&#
   *
   * @param length - Tamanho da senha (padrão: 12, entre 8 e 20)
   * @returns Senha gerada
   */
  generate(length: number = 12, qtd: number = 1): string[] {
    const passwordLength = Math.max(8, Math.min(20, length));

    const passwords: string[] = [];
    for (let i = 0; i < qtd; i++) {
      let password = '';
      password += this.getRandomChar(this.lowercaseChars);
      password += this.getRandomChar(this.uppercaseChars);
      password += this.getRandomChar(this.numberChars);
      password += this.getRandomChar(this.specialChars);

      const remainingLength = passwordLength - password.length;
      for (let i = 0; i < remainingLength; i++) {
        password += this.getRandomChar(this.allAllowedChars);
      }

      passwords.push(this.shuffleString(password));
    }

    return passwords;
  }

  async generateHash(password: string): Promise<string> {
    return await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS as string));
  }

  async validateHash(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  private getRandomChar(chars: string): string {
    return chars[Math.floor(Math.random() * chars.length)];
  }

  private shuffleString(str: string): string {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }

  generateOne(length: number = 12): string {
    return this.generate(length, 1)[0];
  }

  validate(password: string): boolean {
    if (password.length === 0) return false;

    return !!(password.length >= 8 && password.length <= 20 &&
      password.match(/[a-z]/) &&
      password.match(/[A-Z]/) &&
      password.match(/[0-9]/) &&
      password.match(/[@$!%*?&]/) &&
      password.match(/[#]/) &&
      password.match(/[a-zA-Z0-9@$!%*?&#]/))
  }
}

