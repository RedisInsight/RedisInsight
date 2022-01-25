import { acceptLicenseTermsAndAddDatabase, clearDatabaseInCli, deleteDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    CliPage,
    WorkbenchPage
} from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const cliPage = new CliPage();

fixture `Database overview`
    .meta({type: 'regression'})
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Clear and delete database
        await clearDatabaseInCli();
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test('Verify that user can see total memory and total number of keys updated in DB header in Workbench page', async t => {
    //Create new keys
    await cliPage.addKeysFromCli('MSET', 10);
    //Open Workbench
    await t.click(myRedisDatabasePage.workbenchButton);
    //Verify that user can see total memory and total number of keys
    await t.expect(workbenchPage.overviewTotalKeys.exists).ok('User can see total keys');
    await t.expect(workbenchPage.overviewTotalMemory.exists).ok('User can see total memory');
});
