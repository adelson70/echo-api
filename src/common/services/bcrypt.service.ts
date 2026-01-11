import { Injectable } from "@nestjs/common";
import { hash, compare } from "bcrypt";

@Injectable()
export class BcryptService {
    constructor() {}

    async hash(password: string): Promise<string> {
        return hash(password, Number(process.env.BCRYPT_SALT) || 10);
    }

    async compare(password: string, hash: string): Promise<boolean> {
        return compare(password, hash);
    }
}