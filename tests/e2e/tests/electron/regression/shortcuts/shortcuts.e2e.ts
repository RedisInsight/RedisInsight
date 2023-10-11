// import { ClientFunction } from 'testcafe';
import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import { commonUrl } from '../../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();
// const getPageUrl = ClientFunction(() => window.location.href);

fixture `Shortcuts`
    .meta({ type: 'regression', rte: rte.none })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
    });
test('Verify that user can see a summary of Shortcuts by clicking "Keyboard Shortcuts" button in Help Center for desktop', async t => {
    // Click on help center icon and verify panel
    await t.click(myRedisDatabasePage.NavigationPanel.helpCenterButton);
    await t.expect(myRedisDatabasePage.NavigationPanel.HelpCenter.helpCenterPanel.exists).ok('Help Center panel is not opened');
    // Click on Shortcuts option and verify panel
    await t.click(myRedisDatabasePage.NavigationPanel.HelpCenter.helpCenterShortcutButton);
    await t.expect(myRedisDatabasePage.ShortcutsPanel.shortcutsPanel.exists).ok('Shortcuts panel is not opened');
    // Validate Title and sections of Shortcuts
    await t.expect(myRedisDatabasePage.ShortcutsPanel.shortcutsPanel.exists).ok('Shortcuts panel is not opened');
    await t.expect(myRedisDatabasePage.ShortcutsPanel.shortcutsTitle.exists).ok('shortcutsTitle is not opened');
    await t.expect(myRedisDatabasePage.ShortcutsPanel.shortcutsDesktopApplicationSection.exists).ok('shortcutsDesktopApplicationSection is not opened');
    await t.expect(myRedisDatabasePage.ShortcutsPanel.shortcutsCLISection.exists).ok('shortcutsCLISection is not displayed');
    await t.expect(myRedisDatabasePage.ShortcutsPanel.shortcutsWorkbenchSection.exists).ok('shortcutsWorkbenchSection is not displayed');
    // Verify that user can close the Shortcuts
    await t.click(myRedisDatabasePage.ShortcutsPanel.shortcutsCloseButton);
    await t.expect(myRedisDatabasePage.ShortcutsPanel.shortcutsPanel.exists).notOk('Shortcuts panel is not displayed');
});
