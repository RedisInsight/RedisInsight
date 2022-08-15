export enum CliOutputFormatterTypes {
  Text = 'TEXT',
  Raw = 'RAW',
  UTF8 = 'UTF8',
}

export interface IRedirectionInfo {
  slot: string;
  address: string;
}

export interface IOutputFormatterStrategy {
  format(reply: any, redirectedTo?: IRedirectionInfo): any;
}
