export interface IFormatter {
  format(data: any): Promise<string>;
}
