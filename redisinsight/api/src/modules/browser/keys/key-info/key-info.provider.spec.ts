import { Test, TestingModule } from '@nestjs/testing';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import { mockRedisConsumer } from 'src/__mocks__';
import { KeyInfoProvider } from 'src/modules/browser/keys/key-info/key-info.provider';
import { RedisDataType } from 'src/modules/browser/keys/dto';
import {
  UnsupportedTypeInfoStrategy,
} from 'src/modules/browser/keys/key-info/strategies/unsupported.type-info.strategy';
import { GraphTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/graph.type-info.strategy';
import { HashTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/hash.type-info.strategy';
import { ListTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/list.type-info.strategy';
import { RejsonRlTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/rejson-rl.type-info.strategy';
import { SetTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/set.type-info.strategy';
import { StreamTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/stream.type-info.strategy';
import { StringTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/string.type-info.strategy';
import { TsTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/ts.type-info.strategy';
import { ZSetTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/z-set.type-info.strategy';

describe('KeyInfoProvider', () => {
  let service: KeyInfoProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeyInfoProvider,
        GraphTypeInfoStrategy,
        HashTypeInfoStrategy,
        ListTypeInfoStrategy,
        RejsonRlTypeInfoStrategy,
        SetTypeInfoStrategy,
        StreamTypeInfoStrategy,
        StringTypeInfoStrategy,
        TsTypeInfoStrategy,
        ZSetTypeInfoStrategy,
        UnsupportedTypeInfoStrategy,
        {
          provide: BrowserToolService,
          useFactory: mockRedisConsumer,
        },
      ],
    }).compile();

    service = module.get(KeyInfoProvider);
  });

  describe('getStrategy', () => {
    const testCases = [
      { input: 'unknown' as RedisDataType, strategy: UnsupportedTypeInfoStrategy },
      { input: RedisDataType.Graph, strategy: GraphTypeInfoStrategy },
      { input: RedisDataType.Hash, strategy: HashTypeInfoStrategy },
      { input: RedisDataType.List, strategy: ListTypeInfoStrategy },
      { input: RedisDataType.JSON, strategy: RejsonRlTypeInfoStrategy },
      { input: RedisDataType.Set, strategy: SetTypeInfoStrategy },
      { input: RedisDataType.Stream, strategy: StreamTypeInfoStrategy },
      { input: RedisDataType.String, strategy: StringTypeInfoStrategy },
      { input: RedisDataType.TS, strategy: TsTypeInfoStrategy },
      { input: RedisDataType.ZSet, strategy: ZSetTypeInfoStrategy },
    ];

    testCases.forEach((tc) => {
      it(`Should return ${tc.strategy} strategy for ${tc.input} type`, () => {
        expect(service.getStrategy(tc.input)).toBeInstanceOf(tc.strategy);
      });
    });
  });
});
