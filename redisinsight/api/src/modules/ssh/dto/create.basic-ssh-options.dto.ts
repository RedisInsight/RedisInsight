import { OmitType } from '@nestjs/swagger';
import { SshOptions } from 'src/modules/ssh/models/ssh-options';

export class CreateBasicSshOptionsDto extends OmitType(SshOptions, ['privateKey', 'passphrase'] as const) {}
