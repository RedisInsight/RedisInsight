import {
  mockRedisClusterNodesResponse,
  mockRedisServerInfoResponse,
  mockStandaloneRedisInfoReply,
} from 'src/__mocks__';
import { IRedisClusterNode, RedisClusterNodeLinkState } from 'src/models';
import {
  convertBulkStringsToObject,
  convertRedisInfoReplyToObject,
  parseClusterNodes,
} from './redis-reply-converter';

const mockRedisClusterNodesDto: IRedisClusterNode[] = [
  {
    id: '07c37dfeb235213a872192d90877d0cd55635b91',
    host: '127.0.0.1',
    port: 30004,
    replicaOf: 'e7d1eecce10fd6bb5eb35b9f99a514335d9ba9ca',
    linkState: RedisClusterNodeLinkState.Connected,
    slot: undefined,
  },
  {
    id: 'e7d1eecce10fd6bb5eb35b9f99a514335d9ba9ca',
    host: '127.0.0.1',
    port: 30001,
    replicaOf: undefined,
    linkState: RedisClusterNodeLinkState.Connected,
    slot: '0-16383',
  },
];

const mockRedisServerInfoDto = {
  redis_version: '6.0.5',
  redis_mode: 'standalone',
  os: 'Linux 4.15.0-1087-gcp x86_64',
  arch_bits: '64',
  tcp_port: '11113',
  uptime_in_seconds: '1000',
};

const mockStandaloneRedisInfoDto = {
  server: mockRedisServerInfoDto,
  clients: {
    connected_clients: '1',
    client_longest_output_list: '0',
    client_biggest_input_buf: '0',
    blocked_clients: '0',
  },
  memory: {
    used_memory: '1000000',
    used_memory_human: '1M',
    used_memory_rss: '1000000',
    used_memory_peak: '1000000',
    used_memory_peak_human: '1M',
    used_memory_lua: '37888',
    mem_fragmentation_ratio: '1',
    mem_allocator: 'jemalloc-5.1.0',
  },
  cluster: {
    cluster_enabled: '0',
  },
  keyspace: {
    db0: 'keys=1,expires=0,avg_ttl=0',
  },
  stats: {
    keyspace_hits: '1000',
    keyspace_misses: '0',
  },
  replication: {
    role: 'master',
    connected_slaves: '0',
    master_repl_offset: '0',
    repl_backlog_active: '0',
    repl_backlog_size: '1000',
    repl_backlog_first_byte_offset: '0',
    repl_backlog_histlen: '0',
  },
};

const mockIncorrectString = '$6\r\nfoobar\r\n';

describe('convertBulkStringsToObject', () => {
  it('should return object in a defined format', async () => {
    const result = convertBulkStringsToObject(mockRedisServerInfoResponse);

    expect(result).toEqual(mockRedisServerInfoDto);
  });
  it('should return empty object in case of incorrect string', async () => {
    const result = convertBulkStringsToObject(mockIncorrectString);

    expect(result).toEqual({});
  });
});

describe('convertRedisReplyInfoToObject', () => {
  it('should return object in a defined format', async () => {
    const result = convertRedisInfoReplyToObject(mockStandaloneRedisInfoReply);

    expect(result).toEqual(mockStandaloneRedisInfoDto);
  });
  it('should return empty object when incorrect string passed', async () => {
    const result = convertRedisInfoReplyToObject(mockIncorrectString);

    expect(result).toEqual({});
  });
});

describe('parseClusterNodes', () => {
  it('should return array object in a defined format', async () => {
    const result = parseClusterNodes(mockRedisClusterNodesResponse);

    expect(result).toEqual(mockRedisClusterNodesDto);
  });
  it('should return empty array when incorrect string passed', async () => {
    const result = parseClusterNodes(mockIncorrectString);

    expect(result).toEqual([]);
  });
});
