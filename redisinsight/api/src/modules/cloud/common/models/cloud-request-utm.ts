import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Default } from 'src/common/decorators';

export class CloudRequestUtm {
  @ApiPropertyOptional({
    type: String,
    default: 'redisinsight',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Default('redisinsight')
  source? = 'redisinsight';

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Default('sso')
  medium? = 'sso';

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  campaign?: string;

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  amp?: string;

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  package?: string;
}
