import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    CliPage,
    WorkbenchPage
} from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Common } from '../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const cliPage = new CliPage();
const common = new Common();

let keys: string[];

fixture `Database overview`
    .meta({type: 'regression'})
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Clear and delete database
        await cliPage.sendCommandInCli(`DEL ${keys.join(' ')}`);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test('Verify that user can see total memory and total number of keys updated in DB header in Workbench page', async t => {
    //Create new keys
    keys = await common.createArrayWithKeyValue(10);
    await cliPage.sendCommandInCli(`MSET ${keys.join(' ')}`);
    //Open Workbench
    await t.click(myRedisDatabasePage.workbenchButton);
    //Verify that user can see total memory and total number of keys
    await t.expect(workbenchPage.overviewTotalKeys.exists).ok('User can see total keys');
    await t.expect(workbenchPage.overviewTotalMemory.exists).ok('User can see total memory');
});
