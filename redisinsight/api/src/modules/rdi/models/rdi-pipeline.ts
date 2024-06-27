import {
  IsObject, IsOptional,
} from 'class-validator';

export class RdiPipeline {
  @IsOptional()
  @IsObject()
  // todo add validation
  jobs: { [key: string]: object };

  @IsOptional()
  @IsObject()
  config: object;
}
