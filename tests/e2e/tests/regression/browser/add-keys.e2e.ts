import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabase } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const browserPage = new BrowserPage();
const jsonKeys = [['JSON-string', '"test"'], ['JSON-number', '782364'], ['JSON-array', '[1, 2, 3]'], ['JSON-boolean', 'true'], ['JSON-null', 'null']];

fixture `Different JSON types creation`
    .meta({
        type: 'regression',
        rte: rte.standalone
    })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
test('Verify that user can create different types of JSON', async t => {
    for (let i = 0; i < jsonKeys.length; i++) {
        await browserPage.addJsonKey(jsonKeys[i][0], jsonKeys[i][1]);
        await t.click(browserPage.refreshKeysButton);
        await t.wait(3000);
        await t.expect(await browserPage.isKeyIsDisplayedInTheList(jsonKeys[i][0])).ok('New keys is displayed');
    }
});
