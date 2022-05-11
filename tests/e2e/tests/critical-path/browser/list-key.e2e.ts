import { toNumber } from 'lodash';
import { Chance } from 'chance';
import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { BrowserPage, CliPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig,
    ossStandaloneV5Config
} from '../../../helpers/conf';

const browserPage = new BrowserPage();
const cliPage = new CliPage();
const chance = new Chance();

let keyName = chance.word({ length: 10 });
const keyTTL = '2147476121';
const element = '1111listElement11111';
const element2 = '2222listElement22222';
const element3 = '33333listElement33333';

fixture `List Key verification`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    });
test
    .meta({ rte: rte.standalone })('Verify that user can search List element by index', async t => {
        keyName = chance.word({ length: 10 });
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
    .meta({ rte: rte.standalone })
    .before(async() => {
        // add oss standalone v5
        await acceptLicenseTermsAndAddDatabase(ossStandaloneV5Config, ossStandaloneV5Config.databaseName);
    })
    .after(async() => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneV5Config.databaseName);
    })('Verify that user can remove only one element for List for Redis v. <6.2', async t => {
        keyName = chance.word({ length: 10 });
        //Open CLI
        await t.click(cliPage.cliExpandButton);
        //Create new key
        await t.typeText(cliPage.cliCommandInput, `LPUSH ${keyName} 1 2 3 4 5`);
        await t.pressKey('enter');
        await t.click(cliPage.cliCollapseButton);
        //Remove element from the key
        await browserPage.openKeyDetails(keyName);
        const lengthBeforeRemove = (await browserPage.keyLengthDetails.textContent).split(': ')[1];
        await browserPage.removeListElementFromHeadOld();
        //Check that only one element is removed
        const lengthAfterRemove = (await browserPage.keyLengthDetails.textContent).split(': ')[1];
        const removedElements = toNumber(lengthBeforeRemove) - toNumber(lengthAfterRemove);
        await t.expect(removedElements).eql(1, 'only one element is removed');
    });
