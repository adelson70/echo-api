import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodError, type ZodObject } from 'zod';

@Injectable()
export class ZodPipe implements PipeTransform {
  constructor(private readonly schema: ZodObject) {}

  transform(value: any) {
    try {
      const parsed = this.schema.parse(value);
      return parsed;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(error.issues);
      }
      throw error;
    }
  }
}
