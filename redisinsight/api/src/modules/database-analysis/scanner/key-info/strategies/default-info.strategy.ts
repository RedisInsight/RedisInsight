import { AbstractInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/abstract.info.strategy';

export class DefaultInfoStrategy extends AbstractInfoStrategy {
  getLengthCommandArgs(): unknown[] {
    return undefined;
  }

  getLengthValue(): number {
    return 0;
  }
}
