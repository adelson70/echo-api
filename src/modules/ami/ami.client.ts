import {
    Injectable,
    OnModuleInit,
    OnModuleDestroy,
    Logger,
} from '@nestjs/common';
import * as net from 'net';
import { EventEmitter } from 'events';

@Injectable()
export class AmiClient
    extends EventEmitter
    implements OnModuleInit, OnModuleDestroy {
    private socket: net.Socket;
    private logger = new Logger(AmiClient.name);
    onModuleInit() {
        this.connect();
    }

    connect() {
        this.socket = net.createConnection(
            { host: process.env.AMI_HOST, port: Number(process.env.AMI_PORT) },
            () => {
                this.logger.log('✅ Conexão com o AMI estabelecida com sucesso.');
                this.login();
            },
        );

        this.socket.on('data', data =>
            this.handleData(data.toString()),
        );

        this.socket.on('close', () => {
            this.logger.warn('Conexão com o AMI foi fechada. Tentando reconectar...');
            setTimeout(() => this.connect(), 3000);
        });
    }

    login() {
        this.send([
            'Action: Login',
            `Username: ${process.env.AMI_USERNAME}`,
            `Secret: ${process.env.AMI_SECRET}`,
            '',
        ].join('\r\n'));
    }

    send(payload: string) {
        this.socket.write(payload + '\r\n');
    }

    handleData(raw: string) {
        const events = raw.split('\r\n\r\n');

        for (const event of events) {
            if (!event.trim()) continue;

            const parsed = Object.fromEntries(
                event
                    .split('\r\n')
                    .map(l => l.split(': '))
            );

            this.emit(parsed.Event ?? 'response', parsed);
        }
    }

    onModuleDestroy() {
        this.socket?.destroy();
    }
}
