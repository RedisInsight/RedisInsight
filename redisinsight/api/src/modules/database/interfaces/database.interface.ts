export interface IDatabase {
    id: string;
    cloudDetails?: any;  // We use any here to avoid the circular reference
  }