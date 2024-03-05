import { IsOptional, IsString } from 'class-validator';

export class GetRdiStatisticsDto {
  @IsString()
  @IsOptional()
  sections?: string;
}
