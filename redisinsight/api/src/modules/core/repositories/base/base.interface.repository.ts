export interface BaseInterfaceRepository<T> {
  findAll(): Promise<T[]>;

  create(data: T | any): Promise<T>;

  findOneById(id: number | string): Promise<T>;

  delete(id: string): Promise<any>;
}
