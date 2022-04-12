export interface ILogsEmitter {
  id: string;
  emit: (items: any[]) => void;
  addClientObserver: (id: string) => void;
  removeClientObserver: (id: string) => void;
}
