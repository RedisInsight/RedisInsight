import { ServerOnPremiseService } from './server-on-premise.service';

export default {
  provide: 'SERVER_PROVIDER',
  useClass: ServerOnPremiseService,
};
