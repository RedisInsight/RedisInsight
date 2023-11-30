import { RdiJob } from 'src/modules/rdi/models/rdi-job';

export class RdiPipeline {
  // todo: defined high-level schema. not sure if we need it at all since we are not going to validate it or we are?

  connection: unknown;

  jobs: RdiJob[];
}
