import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsObject, IsNumber, IsBoolean } from 'class-validator'

export class AzureRedisDatabaseSkuDto {
  @IsString()
  @ApiProperty({ description: 'Azure Redis SKU name' })
  name: string

  @IsString()
  @ApiProperty({ description: 'Azure Redis SKU family' })
  family: string

  @IsNumber()
  @ApiProperty({ description: 'Azure Redis SKU capacity' })
  capacity: number
}

export class AzureRedisDatabasePropertiesDto {
  @IsString()
  @ApiProperty({ description: 'Provisioning state of the database' })
  provisioningState: string

  @IsString()
  @ApiProperty({ description: 'Hostname of the Redis instance' })
  hostName: string

  @IsNumber()
  @ApiProperty({ description: 'Port for Redis connection' })
  port: number

  @IsNumber()
  @ApiProperty({ description: 'SSL port for Redis connection' })
  sslPort: number

  @IsString()
  @ApiProperty({ description: 'Redis version' })
  redisVersion: string

  @IsObject()
  @ApiProperty({ type: AzureRedisDatabaseSkuDto, description: 'SKU information' })
  sku: AzureRedisDatabaseSkuDto

  @IsString()
  @ApiProperty({ description: 'Connection string to connect to the Redis instance' })
  connectionString?: string

  @IsString()
  @ApiProperty({ description: 'Host for Redis connection' })
  host?: string

  @IsString()
  @ApiProperty({ description: 'Password for Redis connection' })
  password?: string

  @IsBoolean()
  @ApiProperty({ description: 'Whether to use SSL for Redis connection' })
  useSsl?: boolean
}

export class AzureRedisDatabaseDto {
  @IsString()
  @ApiProperty({ description: 'Azure resource ID' })
  id: string

  @IsString()
  @ApiProperty({ description: 'Database name' })
  name: string

  @IsString()
  @ApiProperty({ description: 'Resource type' })
  type: string

  @IsString()
  @ApiProperty({ description: 'Azure region/location' })
  location: string

  @IsObject()
  @ApiProperty({ type: AzureRedisDatabasePropertiesDto, description: 'Database properties' })
  properties: AzureRedisDatabasePropertiesDto

  @IsString()
  @ApiProperty({ description: 'ID of the subscription this database belongs to' })
  subscriptionId: string
}