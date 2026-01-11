import { Controller, Get } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor() {}
}
