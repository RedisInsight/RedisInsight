import { IWindowAuthStrategy, IWindowAuthStrategyData } from '../window.auth.strategy.interface';

export abstract class AbstractWindowAuthStrategy implements IWindowAuthStrategy {
  abstract isWindowExists(data: any): Promise<IWindowAuthStrategyData>;
}
