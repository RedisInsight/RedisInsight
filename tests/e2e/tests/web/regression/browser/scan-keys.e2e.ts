import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { MyRedisDatabasePage, SettingsPage } from '../../../../pageObjects';
import { commonUrl } from '../../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const settingsPage = new SettingsPage();
const databaseHelper = new DatabaseHelper();

const explicitErrorHandler = (): void => {
    window.addEventListener('error', e => {
        if(e.message === 'ResizeObserver loop limit exceeded') {
            e.stopImmediatePropagation();
        }
    });
};

fixture `Browser - Specify Keys to Scan`
    .meta({ type: 'regression', rte: rte.none })
    .page(commonUrl)
    .clientScripts({ content: `(${explicitErrorHandler.toString()})()` })
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
    })
    .afterEach(async() => {
        await settingsPage.changeKeysToScanValue('10000');
    });
test('Verify that the user not enter the value less than 500 - the system automatically applies min value if user enters less than min', async t => {
    // Go to Settings page
    await t.click(myRedisDatabasePage.NavigationPanel.settingsButton);
    // Specify keys to scan less than 500
    await t.click(settingsPage.accordionAdvancedSettings);
    await settingsPage.changeKeysToScanValue('100');
    // Verify the applied scan value
    await t.expect(await settingsPage.keysToScanValue.textContent).eql('500', 'The system automatically not applies min value 500');
});
