import { toNumber } from 'lodash';
import { addNewStandaloneDatabase } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    BrowserPage,
    UserAgreementPage,
    CliPage,
    AddRedisDatabasePage
} from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig,
    ossStandaloneV5Config
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const cliPage = new CliPage();

fixture `List Key verification`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', { timeout: 20000 });
        await addNewStandaloneDatabase(ossStandaloneConfig);
    })
    .afterEach(async() => {
        await browserPage.deleteKey();
    })
    const keyName = 'List1testKeyForAddMember';
    const keyTTL = '2147476121';
    const element = '1111listElement11111';
    const element2 = '2222listElement22222';
    const element3 = '33333listElement33333';
test
    .meta({ rte: 'standalone' })
    ('Verify that user can search List element by index', async t => {
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await browserPage.addListKey(keyName, keyTTL, element);
        //Add few elements to the List key
        await browserPage.addElementToList(element2);
        await browserPage.addElementToList(element3);
        //Search List element by index
        await browserPage.searchByTheValueInKeyDetails('1');
        //Check the search result
        const result = await browserPage.listElementsList.nth(0).textContent;
        await t.expect(result).eql(element2, 'The list elemnt with searched index');
    });
test
    .meta({ rte: 'standalone' })
    .before(async(t) => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', {timeout: 20000});
        // add oss standalone v5
        await addNewStandaloneDatabase(ossStandaloneV5Config);
    })
    ('Verify that user can remove only one element for List for Redis v. <6.2', async t => {
        const keyName = 'ListKey-Lorem123123';
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneV5Config.databaseName);
        //Open CLI
        await t.click(cliPage.cliExpandButton);
        //Create new key
        await t.typeText(cliPage.cliCommandInput, `LPUSH ${keyName} 1 2 3 4 5`);
        await t.pressKey('enter');
        await t.click(cliPage.cliCollapseButton);
        //Remove element from the key
        await browserPage.openKeyDetails(keyName);
        const lengthBeforeRemove = await (await browserPage.keyLengthDetails.textContent).split('(')[1].split(')')[0];
        await browserPage.removeListElementFromHeadOld();
        //Check that only one element is removed
        const lengthAfterRemove = await (await browserPage.keyLengthDetails.textContent).split('(')[1].split(')')[0];
        const removedElements = toNumber(lengthBeforeRemove) - toNumber(lengthAfterRemove);
        await t.expect(removedElements).eql(1, 'only one element is removed');
    });
