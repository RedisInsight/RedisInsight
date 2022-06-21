import { initialMigration1614164490968 } from './1614164490968-initial-migration';
import { connectionType1615480887019 } from './1615480887019-connection-type';
import { databaseNameFromProvider1615990079125 } from './1615990079125-database-name-from-provider';
import { removeDatabaseType1615992183565 } from './1615992183565-remove-database-type';
import { ossSentinel1616520395940 } from './1616520395940-oss-sentinel';
import { agreements1625771635418 } from './1625771635418-agreements';
import { serverInfo1626086601057 } from './1626086601057-server-info';
import { databaseHostingProvider1626904405170 } from './1626904405170-database-hosting-provider';
import { settings1627556171227 } from './1627556171227-settings';
import { databaseModules1629729923740 } from './1629729923740-database-modules';
import { databaseDbIndex1634219846022 } from './1634219846022-database-db-index';
import { encryption1634557312500 } from './1634557312500-encryption';
import { commandExecution1641795882696 } from './1641795882696-command-execution';
import { pluginState1641805606399 } from './1641805606399-plugin-state';
import { sni1650278664000 } from "./1650278664000-sni";
import { notification1655821010349 } from './1655821010349-notification';

export default [
  initialMigration1614164490968,
  connectionType1615480887019,
  databaseNameFromProvider1615990079125,
  removeDatabaseType1615992183565,
  ossSentinel1616520395940,
  agreements1625771635418,
  serverInfo1626086601057,
  databaseHostingProvider1626904405170,
  settings1627556171227,
  databaseModules1629729923740,
  databaseDbIndex1634219846022,
  encryption1634557312500,
  commandExecution1641795882696,
  pluginState1641805606399,
  sni1650278664000,
  notification1655821010349,
];
