import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Client } from 'ssh2';

@Injectable()
export class SshService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SshService.name);
  private client: Client;

  async onModuleInit() {
    this.logger.log('Conectando via SSH ao servidor Asterisk...');

    this.client = new Client();

    await new Promise<void>((resolve, reject) => {
      this.client
        .on('ready', () => {
          this.logger.log('✅ SSH conectado com sucesso');
          resolve();
        })
        .on('error', (err) => {
          this.logger.error('Erro na conexão SSH', err);
          reject(err);
        })
        .connect({
          host: process.env.ASTERISK_SSH_HOST,
          port: 22,
          username: process.env.ASTERISK_SSH_USER,
          password: process.env.ASTERISK_SSH_PASSWORD, // 🔴 temporário
        });
    });
  }

  async exec(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.exec(command, (err, stream) => {
        if (err) return reject(err);

        let output = '';

        stream
          .on('data', (data) => {
            output += data.toString();
          })
          .stderr.on('data', (data) => {
            output += data.toString();
          });

        stream.on('close', () => resolve(output));
      });
    });
  }

  onModuleDestroy() {
    this.logger.log('Encerrando conexão SSH');
    this.client?.end();
  }
}
