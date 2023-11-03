import { Injectable } from '@nestjs/common';
import { IScannerStrategy } from 'src/modules/browser/keys/scanner/scanner.interface';
import { ClusterScannerStrategy } from 'src/modules/browser/keys/scanner/strategies/cluster.scanner.strategy';
import { StandaloneScannerStrategy } from 'src/modules/browser/keys/scanner/strategies/standalone.scanner.strategy';
import { ConnectionType } from 'src/modules/database/entities/database.entity';

@Injectable()
export class Scanner {
  constructor(
    private readonly standaloneStrategy: StandaloneScannerStrategy,
    private readonly clusterStrategy: ClusterScannerStrategy,
  ) {}

  getStrategy(connectionType: ConnectionType): IScannerStrategy {
    switch (connectionType) {
      case ConnectionType.STANDALONE:
      case ConnectionType.SENTINEL:
        return this.standaloneStrategy;
      case ConnectionType.CLUSTER:
        return this.clusterStrategy;
      default:
        throw new Error(`Unsupported scan strategy: ${connectionType}`);
    }
  }
}
