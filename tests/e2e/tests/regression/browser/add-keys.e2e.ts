import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { BrowserPage, CliPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const browserPage = new BrowserPage();
const cliPage = new CliPage();
const jsonKeys = [['JSON-string', '"test"'], ['JSON-number', '782364'], ['JSON-boolean', 'true'], ['JSON-null', 'null'], ['JSON-array', '[1, 2, 3]']];

fixture `Different JSON types creation`
    .meta({
        type: 'regression',
        rte: rte.standalone
    })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        let commandString = 'DEL';
        for (const key of jsonKeys) {
            commandString = commandString.concat(` ${key[0]}`);
        }
        await cliPage.sendCommandInCli(commandString);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test('Verify that user can create different types(string, number, null, array, boolean) of JSON', async t => {
    for (let i = 0; i < jsonKeys.length; i++) {
        await browserPage.addJsonKey(jsonKeys[i][0], jsonKeys[i][1]);
        await t.click(browserPage.refreshKeysButton);
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(jsonKeys[i][0])).ok('New keys is displayed');
        if (i === jsonKeys.length - 1) {
            for (const j of JSON.parse(jsonKeys[i][1])) {
                await t.expect(browserPage.jsonScalarValue.withText(j.toString()).exists).ok('JSON value');
            }
        }
        else {
            await t.expect(browserPage.jsonKeyValue.withText(jsonKeys[i][1]).exists).ok('JSON value');
        }
    }
});
