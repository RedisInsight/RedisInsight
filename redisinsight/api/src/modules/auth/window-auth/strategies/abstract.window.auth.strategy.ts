export abstract class AbstractWindowAuthStrategy {
  abstract isWindowExists(data: any): Promise<boolean>;
}
