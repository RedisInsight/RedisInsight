import { Expose } from 'class-transformer';
import { join } from 'path';
import config from 'src/utils/config';

const PATH_CONFIG = config.get('dir_path');

export enum CustomTutorialActions {
  CREATE = 'create',
  DELETE = 'delete',
}

export class CustomTutorial {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  uri: string;

  @Expose()
  link?: string;

  @Expose()
  createdAt: Date;

  get actions(): CustomTutorialActions[] {
    return [CustomTutorialActions.DELETE];
  }

  get path(): string {
    return `/${this.id}`;
  }

  get absolutePath(): string {
    return join(PATH_CONFIG.customTutorials, this.id);
  }
}
