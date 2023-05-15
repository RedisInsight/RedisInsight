import { Expose, Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString, ValidateNested,
} from 'class-validator';
import { IsMultiNumber, ObjectAsMap } from 'src/common/decorators';

export enum FeatureConfigFilterCondition {
  Eq = 'eq',
  Neq = 'neq',
  Gt = 'gt',
  Gte = 'gte',
  Lt = 'lt',
  Lte = 'lte',
}

export class FeatureConfigFilter {
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @IsEnum(FeatureConfigFilterCondition)
  cond: FeatureConfigFilterCondition;

  @Expose()
  value: any;
}

export class FeatureConfig {
  @Expose()
  @IsNotEmpty()
  @IsBoolean()
  flag: boolean;

  @Expose()
  @IsArray({ each: true })
  @IsMultiNumber()
  perc: number[][];

  @Expose()
  @Type(() => FeatureConfigFilter)
  @ValidateNested({ each: true })
  filters: FeatureConfigFilter[];
}

export class FeaturesConfigData {
  @Expose()
  @IsNotEmpty()
  @IsNumber()
  version: number;

  @Expose()
  @ObjectAsMap(FeatureConfig)
  @ValidateNested({ each: true })
  features: Map<string, FeatureConfig>;
}

export class FeaturesConfig {
  @Expose()
  @IsNumber()
  controlNumber: number;

  @Expose()
  @Type(() => FeaturesConfigData)
  @ValidateNested()
  data: FeaturesConfigData;
}
