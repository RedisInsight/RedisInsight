import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendAiExtendedMessageDto {
  @ApiProperty({
    description: 'Message content',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'Pipeline configuration YAML content',
    type: String,
  })
  @IsOptional()
  @IsString()
  pipelineConfig?: string;

  @ApiPropertyOptional({
    description: 'Pipeline jobs YAML content as JSON string',
    type: String,
  })
  @IsOptional()
  @IsString()
  pipelineJobs?: string;
}
