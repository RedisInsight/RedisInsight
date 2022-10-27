import {
  TlsDto,
} from 'src/modules/instances/dto/database-instance.dto';

export interface ISentinelConnectionOptions {
  name: string;
  sentinels: Array<{ host: string; port: number }>;
  sentinelUsername?: string;
  sentinelPassword?: string;
  tls?: TlsDto;
}
