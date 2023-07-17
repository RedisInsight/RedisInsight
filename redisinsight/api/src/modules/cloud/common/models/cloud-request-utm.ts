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
  medium?: string;

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  campaign?: string;
}
