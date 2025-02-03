import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import config from 'src/utils/config';

@Injectable()
export class DisableModificationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const AutoImportConfig = config.get('preSetupDatabase');
    if (AutoImportConfig.disableManageConnections) {
      throw new ForbiddenException('Operation is disabled.');
    }

    return true;
  }
}
