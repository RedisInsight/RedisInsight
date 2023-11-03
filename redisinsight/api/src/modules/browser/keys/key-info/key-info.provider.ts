import { GraphTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/graph.type-info.strategy';
import { HashTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/hash.type-info.strategy';
import { ListTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/list.type-info.strategy';
import { RejsonRlTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/rejson-rl.type-info.strategy';
import { SetTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/set.type-info.strategy';
import { StreamTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/stream.type-info.strategy';
import { StringTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/string.type-info.strategy';
import { TsTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/ts.type-info.strategy';
import {
  UnsupportedTypeInfoStrategy,
} from 'src/modules/browser/keys/key-info/strategies/unsupported.type-info.strategy';
import { ZSetTypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/z-set.type-info.strategy';
import { TypeInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/type-info.strategy';
import { RedisDataType } from 'src/modules/browser/keys/dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class KeyInfoProvider {
  constructor(
    private readonly graphTypeInfoStrategy: GraphTypeInfoStrategy,
    private readonly hashTypeInfoStrategy: HashTypeInfoStrategy,
    private readonly listTypeInfoStrategy: ListTypeInfoStrategy,
    private readonly rejsonRlTypeInfoStrategy: RejsonRlTypeInfoStrategy,
    private readonly setTypeInfoStrategy: SetTypeInfoStrategy,
    private readonly streamTypeInfoStrategy: StreamTypeInfoStrategy,
    private readonly stringTypeInfoStrategy: StringTypeInfoStrategy,
    private readonly tsTypeInfoStrategy: TsTypeInfoStrategy,
    private readonly unsupportedTypeInfoStrategy: UnsupportedTypeInfoStrategy,
    private readonly zSetTypeInfoStrategy: ZSetTypeInfoStrategy,
  ) {}

  getStrategy(type?: RedisDataType): TypeInfoStrategy {
    switch (type) {
      case RedisDataType.Graph:
        return this.graphTypeInfoStrategy;
      case RedisDataType.Hash:
        return this.hashTypeInfoStrategy;
      case RedisDataType.List:
        return this.listTypeInfoStrategy;
      case RedisDataType.JSON:
        return this.rejsonRlTypeInfoStrategy;
      case RedisDataType.Set:
        return this.setTypeInfoStrategy;
      case RedisDataType.Stream:
        return this.streamTypeInfoStrategy;
      case RedisDataType.String:
        return this.stringTypeInfoStrategy;
      case RedisDataType.TS:
        return this.tsTypeInfoStrategy;
      case RedisDataType.ZSet:
        return this.zSetTypeInfoStrategy;
      default:
        return this.unsupportedTypeInfoStrategy;
    }
  }
}
