import {
  IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

export class CreateRecommendationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  disabled?: boolean;

  constructor(dto: Partial<CreateRecommendationDto>) {
    Object.assign(this, dto);
  }
}
