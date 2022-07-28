import {
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BrowserSerializeInterceptor } from 'src/common/interceptors/browser-serialize.interceptor';

@UseInterceptors(BrowserSerializeInterceptor)
@UsePipes(new ValidationPipe({ transform: true }))
export abstract class BaseController {}
