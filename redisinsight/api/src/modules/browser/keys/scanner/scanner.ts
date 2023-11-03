import { Injectable } from '@nestjs/common';
import { ClusterScannerStrategy } from 'src/modules/browser/keys/scanner/strategies/cluster.scanner.strategy';
import { StandaloneScannerStrategy } from 'src/modules/browser/keys/scanner/strategies/standalone.scanner.strategy';
import { ConnectionType } from 'src/modules/database/entities/database.entity';
import { ScannerStrategy } from 'src/modules/browser/keys/scanner/strategies/scanner.strategy';

@Injectable()
export class Scanner {
  constructor(
    private readonly standaloneStrategy: StandaloneScannerStrategy,
    private readonly clusterStrategy: ClusterScannerStrategy,
  ) {}

  getStrategy(connectionType: ConnectionType): ScannerStrategy {
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
