export interface IRedisToolOptions {
  enableAutoConnection?: boolean,
}

export const DEFAULT_REDIS_TOOL_OPTIONS: IRedisToolOptions = {
  enableAutoConnection: true,
};
