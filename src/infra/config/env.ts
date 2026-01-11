import { Logger } from '@nestjs/common';

const logger = new Logger('Environment');

process.loadEnvFile();

export class EnvironmentValidator {
  static validate(): void {
    logger.log('🔍 Validando variáveis de ambiente...');

    const requiredVars = [
      'NODE_ENV',
      'PORT',
      'DATABASE_URL',
      'JWT_SECRET_AT',
      'JWT_SECRET_RT',
      'TRANSPORT',
      'RATE_LIMIT_POINTS',
      'RATE_LIMIT_DURATION',
      'RATE_LIMIT_BLOCK_DURATION',
      'USUARIO_ADMIN_SEED',
      'BCRYPT_SALT',
      'JWT_EXPIRE_AT',
      'JWT_EXPIRE_RT',
    ];

    const missingVars: string[] = [];

    requiredVars.forEach((envVar) => {
      if (process.env[envVar]) {
        logger.debug(
          `✅ Variável ${envVar} carregada com o valor: ${process.env[envVar]}`,
        );
      } else {
        missingVars.push(envVar);
      }
    });

    if (missingVars.length > 0) {
      const errorMessage = `❌ Variáveis obrigatórias não encontradas: ${missingVars.join(', ')}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    logger.log('✅ Variáveis de ambiente validadas!');
    this.logConfig();
  }

  private static logConfig(): void {
    logger.log('🔧 Configuração:');
    logger.log(`  🚀 Porta: ${process.env.PORT}`);
    logger.log(`  🌍 Ambiente: ${process.env.NODE_ENV}`);
  }
}
