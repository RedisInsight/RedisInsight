import { addNewStandaloneDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage, UserAgreementPage, AddRedisDatabasePage, WorkbenchPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const workbenchPage = new WorkbenchPage();

fixture `Default scripts area at Workbench`
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
test('Verify that user can expand/collapse the enablement area', async t => {
    //Hover over Enablement area
    await t.hover(workbenchPage.preselectArea);
    //Collapse the area with default scripts
    await t.click(workbenchPage.collapsePreselectAreaButton);
    //Validate that Enablement area is not displayed
    await t.expect(workbenchPage.preselectArea.visible).notOk('Enablement area is collapsed');
    //Expand Enablement area
    await t.click(workbenchPage.expandPreselectAreaButton);
    //Validate that Enablement area is displayed
    await t.expect(workbenchPage.preselectArea.visible).ok('Enablement area is expanded');
});
test('Verify that user can see the [Manual] option in the Enablement area', async t => {
    const optionsForCheck = [
        'Manual',
        'List the Indices',
        'Index info',
        'Search',
        'Aggregate'
    ];
    //Remember the options displayed in the area
    const countOfOptions = await workbenchPage.preselectButtons.count;
    const displayedOptions = [];
    for(let i = 0; i < countOfOptions; i++) {
        displayedOptions.push(await workbenchPage.preselectButtons.nth(i).textContent);
    }
    //Verify the options in the area
    for(let i = 0; i < countOfOptions; i++) {
        await t.expect(displayedOptions[i]).eql(optionsForCheck[i], `Option ${optionsForCheck} is in the Enablement area`);
    }
});
