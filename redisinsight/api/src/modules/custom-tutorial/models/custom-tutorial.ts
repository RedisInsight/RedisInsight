import { Expose } from 'class-transformer';

export class CustomTutorial {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  uri: string;

  @Expose()
  link: string;

  @Expose()
  createdAt: Date;
}
