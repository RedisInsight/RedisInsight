import { Injectable } from '@nestjs/common';
import { IWindowAuthStrategy } from './window.auth.strategy.interface';

@Injectable()
export class WindowAuthManager {
  private strategy: IWindowAuthStrategy = null;

  /**
   * Return strategy on how we are going to work with app(electron) windows auth
   * @param strategy
   */
  setStrategy(
    strategy: IWindowAuthStrategy,
  ): void {
    this.strategy = strategy;
  }

  getStrategy(): IWindowAuthStrategy {
    return this.strategy;
  }
}
