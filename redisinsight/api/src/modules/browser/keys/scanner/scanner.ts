import { Injectable } from '@nestjs/common';
import { IScannerStrategy } from './scanner.interface';

@Injectable()
export class Scanner {
  private strategies = {};

  addStrategy(name: string, strategy: IScannerStrategy): void {
    this.strategies[name] = strategy;
  }

  getStrategy(name: string): IScannerStrategy {
    if (!this.strategies[name]) {
      throw new Error(`Unsupported scan strategy: ${name}`);
    }

    return this.strategies[name];
  }
}
