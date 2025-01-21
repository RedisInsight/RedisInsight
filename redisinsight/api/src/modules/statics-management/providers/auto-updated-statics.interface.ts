export interface IStaticsProviderOptions {
  name: string;
  defaultSourcePath: string;
  destinationPath: string;
  updateUrl: string;
  zip: string;
  buildInfo: string;
  devMode?: boolean
  autoUpdate?: boolean;
  initDefaults?: boolean;
}
