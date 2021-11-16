import { addNewStandaloneDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    UserAgreementPage,
    AddRedisDatabasePage,
    WorkbenchPage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const workbenchPage = new WorkbenchPage();

fixture `Autocomplete for entered commands`
    .meta({type: 'regression'})
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', {timeout: 20000});
        await addNewStandaloneDatabase(ossStandaloneConfig);
        //Connect to DB
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
test('Verify that user can open the "read more" about the command by clicking on the ">" icon or "ctrl+space"', async t => {
    const command = 'HSET'
    const commandDetails = [
      'HSET key field value [field value ...]',
      'Set the string value of a hash field',
      'Arguments:',
      'required key',
      'multiple field value'
    ];
    //Type command
    await t.typeText(workbenchPage.queryInput, command, { replace: true });
    //Open the read more by clicking on the "ctrl+space" and check
    await t.pressKey('ctrl+space');
    await t.expect(await workbenchPage.monacoCommandDetails.exists).ok('The "read more" about the command is opened');
    for(const detail of commandDetails) {
        await t.expect(await workbenchPage.monacoCommandDetails.textContent).contains(detail, `The ${detail} command detail is displayed`)
    }
    //Close the command details
    await t.pressKey('ctrl+space');
    await t.expect(await workbenchPage.monacoCommandDetails.exists).notOk('The "read more" about the command is closed');
});
