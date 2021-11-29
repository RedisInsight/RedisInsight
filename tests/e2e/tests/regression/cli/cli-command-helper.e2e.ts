import { ClientFunction } from 'testcafe';
import { addNewStandaloneDatabase } from '../../../helpers/database'
import {
    MyRedisDatabasePage,
    UserAgreementPage,
    CliPage,
    AddRedisDatabasePage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const cliPage = new CliPage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const COMMAND_GROUP_JSON = 'JSON';
const COMMAND_GROUP_SEARCH = 'Search';

fixture `CLI Command helper`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', { timeout: 20000 });
        await addNewStandaloneDatabase(ossStandaloneConfig);
    })

const getPageUrl = ClientFunction(() => window.location.href);

test.only('Verify that user can see in Command helper and click on new group "JSON", can choose it and see list of commands in the group', async t => {
    const commandForCheck = 'JSON.SET';
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Open CLI
    await t.click(cliPage.cliExpandButton);
    //Select one command from the list
    await cliPage.selectFilterGroupType(COMMAND_GROUP_JSON);
    await t.click(cliPage.cliHelperOutputTitles.withExactText(commandForCheck));
    //Verify results of opened command
    await t.expect(cliPage.cliHelperTitleArgs.textContent).eql('JSON.SET key path value [NX|XX]', 'Selected command title');
    //Click on Read More link for selected command
    await t.click(cliPage.readMoreButton);
    //Check new opened window page with the correct URL
    await t.expect(getPageUrl()).contains('/#jsonset');
    //Check that command info is displayed on the page
    await t.expect(cliPage.cliReadMoreJSONCommandDocumentation().textContent).contains('JSON.SET');
});

test('Verify that user can see in Command helper and click on new group "Search", can choose it and see list of commands in the group', async t => {
    const commandForCheck = 'FT.EXPLAIN';
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    //Open CLI
    await t.click(cliPage.cliExpandButton);
    //Select one command from the list
    await cliPage.selectFilterGroupType(COMMAND_GROUP_SEARCH);
    await t.click(cliPage.cliHelperOutputTitles.withExactText(commandForCheck));
    //Verify results of opened command
    await t.expect(cliPage.cliHelperTitleArgs.textContent).eql('FT.EXPLAIN index query', 'Selected command title');
    //Click on Read More link for selected command
    await t.click(cliPage.readMoreButton);
    //Check new opened window page with the correct URL
    await t.expect(getPageUrl()).contains('/#ftexplain');
    //Check that command info is displayed on the page
    await t.expect(cliPage.cliReadMoreRediSearchCommandDocumentation().textContent).contains('FT.EXPLAIN');
});
