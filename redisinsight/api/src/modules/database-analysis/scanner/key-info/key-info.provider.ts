import { Injectable } from '@nestjs/common';
import { IKeyInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/key-info.strategy.interface';
import { RedisDataType } from 'src/modules/browser/dto';
import {
  DefaultInfoStrategy,
  GraphInfoStrategy,
  HashInfoStrategy,
  ListInfoStrategy,
  SetInfoStrategy,
  StreamInfoStrategy,
  StringInfoStrategy,
  TsInfoStrategy,
  ZSetInfoStrategy,
} from 'src/modules/database-analysis/scanner/key-info/strategies';

@Injectable()
export class KeyInfoProvider {
  private strategies: Map<string, IKeyInfoStrategy> = new Map();

  constructor() {
    this.strategies.set('default', new DefaultInfoStrategy());
    this.strategies.set(RedisDataType.Graph, new GraphInfoStrategy());
    this.strategies.set(RedisDataType.Hash, new HashInfoStrategy());
    this.strategies.set(RedisDataType.List, new ListInfoStrategy());
    this.strategies.set(RedisDataType.Set, new SetInfoStrategy());
    this.strategies.set(RedisDataType.Stream, new StreamInfoStrategy());
    this.strategies.set(RedisDataType.String, new StringInfoStrategy());
    this.strategies.set(RedisDataType.TS, new TsInfoStrategy());
    this.strategies.set(RedisDataType.ZSet, new ZSetInfoStrategy());
  }

  getStrategy(type: string): IKeyInfoStrategy {
    switch (type) {
      case RedisDataType.Graph:
        return this.strategies.get(RedisDataType.Graph);
      case RedisDataType.Hash:
        return this.strategies.get(RedisDataType.Hash);
      case RedisDataType.List:
        return this.strategies.get(RedisDataType.List);
      case RedisDataType.Set:
        return this.strategies.get(RedisDataType.Set);
      case RedisDataType.Stream:
        return this.strategies.get(RedisDataType.Stream);
      case RedisDataType.String:
        return this.strategies.get(RedisDataType.String);
      case RedisDataType.TS:
        return this.strategies.get(RedisDataType.TS);
      case RedisDataType.ZSet:
        return this.strategies.get(RedisDataType.ZSet);
      default:
        return this.strategies.get('default');
    }
  }
}
