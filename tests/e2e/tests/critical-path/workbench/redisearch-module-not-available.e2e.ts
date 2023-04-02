import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { MyRedisDatabasePage, WorkbenchPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneV5Config } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();

const commandForSend = 'FT._LIST';

fixture `Redisearch module not available`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneV5Config, ossStandaloneV5Config.databaseName);
        // Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
    .afterEach(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneV5Config);
    });
test('Verify that user can see the information message that the RediSearch module is not available when he runs any input with "FT." prefix in Workbench', async t => {
    // Send command with 'FT.'
    await workbenchPage.sendCommandInWorkbench(commandForSend);
    // Verify the information message
    await t.expect(await workbenchPage.commandExecutionResult.textContent).contains('Looks like RediSearch is not available', 'The information message');
});
