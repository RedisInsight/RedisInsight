import { rte } from '../../../helpers/constants';
import { acceptLicenseTerms, deleteDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage, AddRedisDatabasePage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const addRedisDatabasePage = new AddRedisDatabasePage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const indexDbMessage = 'When the database is added, you can select logical databases only in CLI. To work with other logical databases in Browser and Workbench, add another database with the same host and port, but a different database index.';

fixture `Logical databases`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTerms();
    })
    .afterEach(async() => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    });
test('Verify that user can add DB with logical index via host and port from Add DB manually form', async t => {
    const index = '10';

    await addRedisDatabasePage.addRedisDataBase(ossStandaloneConfig);
    // Enter logical index
    await t.click(addRedisDatabasePage.databaseIndexCheckbox);
    await t.typeText(addRedisDatabasePage.databaseIndexInput, index, { replace: true, paste: true });
    // Verify that user when users select DB index they can see info message how to work with DB index in add DB screen
    await t.expect(addRedisDatabasePage.databaseIndexMessage.exists).ok('Index message not displayed')
        .expect(addRedisDatabasePage.databaseIndexMessage.innerText).eql(indexDbMessage)
        .expect(addRedisDatabasePage.databaseIndexCheckbox.parent().withExactText('Select Logical Database').exists).ok('Checkbox text not displayed');
    // Click for saving
    await t.click(addRedisDatabasePage.addRedisDatabaseButton);
    // Verify that the database is in the list
    await t.expect(myRedisDatabasePage.dbNameList.withText(ossStandaloneConfig.databaseName).exists).ok('Database not exist', { timeout: 10000 });
    // Verify that if user adds DB with logical DB > 0, DB name contains postfix "space+[{database index}]"
    await t.expect(myRedisDatabasePage.dbNameList.textContent).eql(`${ossStandaloneConfig.databaseName} [${index}]`, 'The postfix is not added to the database name', { timeout: 10000 });
});
