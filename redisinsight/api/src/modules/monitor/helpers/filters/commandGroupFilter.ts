import { IOnDatePayload } from 'src/modules/monitor/helpers/client-monitor-observer';

export type MonitorFilter = (data: IOnDatePayload) => Promise<boolean>;

export const commandGroupFilter = (
  group: string,
  doc: Record<string, any>,
): MonitorFilter => async (data: IOnDatePayload) => {
  const command = data.args[0];
  return doc[command.toUpperCase()]?.group === group;
};
