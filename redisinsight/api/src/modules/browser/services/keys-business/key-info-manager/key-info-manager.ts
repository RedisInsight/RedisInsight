import { IKeyInfoStrategy } from './key-info-manager.interface';

export class KeyInfoManager {
  private strategies = {};

  private readonly defaultStrategy: IKeyInfoStrategy;

  constructor(defaultStrategy: IKeyInfoStrategy) {
    this.defaultStrategy = defaultStrategy;
  }

  addStrategy(name: string, strategy: IKeyInfoStrategy): void {
    this.strategies[name] = strategy;
  }

  getStrategy(name: string): IKeyInfoStrategy {
    if (!this.strategies[name]) {
      return this.defaultStrategy;
    }

    return this.strategies[name];
  }
}
