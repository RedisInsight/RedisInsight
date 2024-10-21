import config from 'src/utils/config';
import { Config } from 'src/utils';
import { RedisClient } from 'src/modules/redis/client';
import { AiAuthData } from '../models';
import { AiDatabaseAgreement } from '../../agreements/models/ai.database.agreement';

export const aiConfig = config.get('ai') as Config['ai'];

export const COMMANDS_WHITELIST = {
  'ft.search': true,
  'ft.aggregate': true,
};

export const NO_AI_AGREEMENT_ERROR = 'Permission to run a query was not granted';
export const NO_GENERAL_AGREEEMENT_ERROR = 'Permission to run use Redis Copilot was not granted';

export interface GetContextProps {
  databaseId: string;
  auth: AiAuthData;
  client: RedisClient;
  databaseAgreement: AiDatabaseAgreement;
}
