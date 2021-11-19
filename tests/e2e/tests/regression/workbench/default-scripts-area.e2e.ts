import { addNewStandaloneDatabase } from '../../../helpers/database';
import { WorkbenchPage } from '../../../pageObjects/workbench-page';
import { MyRedisDatabasePage, UserAgreementPage, AddRedisDatabasePage } from '../../../pageObjects';
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
test.only('Verify that user can resize(maximize)/(minimize) the enablement area (the one with default scripts)', async t => {
    const offsetX = 100;
    const areaWidthBefore = await workbenchPage.preselectsAreaContainer.clientWidth;
    //Minimize the area with default scripts
    await t.drag(workbenchPage.resizeButtonForPreselectsArea, -offsetX, 0, { speed: 0.2 });
    await t.expect(await workbenchPage.preselectsAreaContainer.clientWidth).lt(areaWidthBefore, 'Default scripts area is smaller after resize');
    //Maximize the area with default scripts
    const areaWidthAfter = await workbenchPage.preselectsAreaContainer.clientWidth;
    await t.click(workbenchPage.resizeButtonForScriptingAndResults);
    await t.drag(workbenchPage.resizeButtonForPreselectsArea, offsetX, 0, { speed: 0.2 });
    await t.expect(await workbenchPage.preselectsAreaContainer.clientWidth).gt(areaWidthAfter, 'Default scripts area is bigger after resize');
});
test('Verify that user can expand/collapse the enablement area', async t => {
    //Collapse the area with default scripts
    await t.doubleClick(workbenchPage.resizeButtonForPreselectsArea);
    await t.expect(await workbenchPage.preselectButtons.visible).eql(false, 'Default scripts area after resize is minimized');
    //Expand the area with default scripts
    await t.click(workbenchPage.preselectsAreaContainer);
    await t.expect(await workbenchPage.preselectButtons.visible).eql(true, 'Default scripts area after resize is maximized');
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
