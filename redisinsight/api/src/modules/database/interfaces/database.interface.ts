export interface IDatabase {
  id: string;
  ssh?: boolean;
  sshOptions?: any; // or define a proper interface
  // ... other properties you need
} 