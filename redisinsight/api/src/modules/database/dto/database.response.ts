import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Database } from 'src/modules/database/models/database';
import { SshOptionsResponse } from 'src/modules/ssh/dto/ssh-options.response.';
import { Expose, Type } from 'class-transformer';
import { HiddenField } from 'src/common/decorators/hidden-field.decorator';

export class DatabaseResponse extends OmitType(Database, ['password', 'sshOptions'] as const) {
  @ApiPropertyOptional({
    description: 'The database password flag (true if password was set)',
    type: Boolean,
  })
  @Expose()
  @HiddenField(true)
  password?: boolean;

  @ApiPropertyOptional({
    description: 'Ssh options',
    type: SshOptionsResponse,
  })
  @Expose()
  @Type(() => SshOptionsResponse)
  sshOptions?: SshOptionsResponse;
}
