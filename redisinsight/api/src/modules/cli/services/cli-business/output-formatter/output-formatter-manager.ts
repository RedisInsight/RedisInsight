import { RunQueryMode } from 'src/modules/workbench/dto/create-command-execution.dto';
import {
  CliOutputFormatterTypes,
  IOutputFormatterStrategy,
} from './output-formatter.interface';

export class OutputFormatterManager {
  private strategies = {};

  addStrategy(
    name: CliOutputFormatterTypes | RunQueryMode,
    strategy: IOutputFormatterStrategy,
  ): void {
    this.strategies[name] = strategy;
  }

  getStrategy(name: CliOutputFormatterTypes | RunQueryMode): IOutputFormatterStrategy {
    if (!this.strategies[name]) {
      throw new Error(`Unsupported formatter strategy: ${name}`);
    }

    return this.strategies[name];
  }
}
