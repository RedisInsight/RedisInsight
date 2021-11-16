export interface StateWorkbenchSettings {
  wbClientUuid: string;
  loading: boolean;
  error: string;
  errorClient: string;
  unsupportedCommands: string[];
}

export interface StateWorkbenchResults {
  loading: boolean;
  error: string;
  commandHistory: string[];
}

export enum EnablementAreaComponent {
  CodeButton = 'code-button',
  Group = 'group',
  InternalLink = 'internal-link',
}

export interface IEnablementAreaItem {
  id: string,
  type: EnablementAreaComponent,
  label: string,
  children?: IEnablementAreaItem[],
  args?: Record<string, any>,
}

export interface StateWorkbenchEnablementArea {
  loading: boolean;
  error: string;
  items: IEnablementAreaItem[];
}
