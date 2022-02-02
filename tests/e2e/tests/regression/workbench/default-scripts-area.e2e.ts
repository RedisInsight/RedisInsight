import { addNewStandaloneDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage, UserAgreementPage, AddRedisDatabasePage, WorkbenchPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';

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
test
    .meta({ rte: rte.standalone })
    ('Verify that user can expand/collapse the enablement area', async t => {
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
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see the [Manual] option in the Enablement area', async t => {
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
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see saved article in Enablement area when he leaves Workbench page and goes back again', async t => {
        //Open Working with Hashes section
        await t.click(workbenchPage.internalLinkWorkingWithHashes);
        //Check the button from Hash page is visible
        await t.expect(workbenchPage.preselectHashCreate.visible).ok('The end of the page is visible');
        //Go to Browser page
        await t.click(myRedisDatabasePage.browserButton);
        //Go back to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
        //Verify that the same article is opened in Enablement area
        await t.expect(workbenchPage.preselectHashCreate.visible).ok('The end of the page is visible');
        //Go to list of DBs page
        await t.click(myRedisDatabasePage.myRedisDBButton);
        //Go back to active DB again
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //Check that user is on Workbench page and "Working with Hashes" page is displayed
        await t.expect(workbenchPage.preselectHashCreate.visible).ok('The end of the page is visible');
    });
//skipped due the issue RI-2384
test.skip
    .meta({ rte: rte.standalone })
    ('Verify that user can see saved scroll position in Enablement area when he leaves Workbench page and goes back again', async t => {
        //Open Working with Hashes section
        await t.click(workbenchPage.internalLinkWorkingWithHashes);
        //Evaluate the last button in Enablement Area
        const buttonsQuantity = await workbenchPage.preselectButtons.count;
        const lastButton = workbenchPage.preselectButtons.nth(buttonsQuantity - 1);
        //Scroll to the very bottom of the page
        await t.scrollIntoView(lastButton);
        //Check the scroll position
        const scrollPosition = await workbenchPage.scrolledEnablementArea.scrollTop;
        //Go to Browser page
        await t.click(myRedisDatabasePage.browserButton);
        //Go back to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
        //Check that scroll position is saved
        await t.expect(workbenchPage.scrolledEnablementArea.scrollTop).eql(scrollPosition, 'The scroll position status');
        //Go to list of DBs page
        await t.click(myRedisDatabasePage.myRedisDBButton);
        //Go back to active DB again
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //Check that scroll position is saved
        await t.expect(workbenchPage.scrolledEnablementArea.scrollTop).eql(scrollPosition, 'Scroll position is correct');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see the siblings menu by clicking on page counter element between Back and Next buttons', async t => {
        const popoverButtons = [
            'Introduction',
            'Working with Hashes',
            'Working with JSON',
            'Learn More'
        ]
        //Open Working with Hashes section and click on the on page counter
        await t.click(workbenchPage.internalLinkWorkingWithHashes);
        await t.click(workbenchPage.enablementAreaPagination);
        //Verify the siblings menu
        await t.expect(workbenchPage.enablementAreaPaginationPopover.visible).ok('The siblings menu is displayed');
        const countOfButtons = await workbenchPage.paginationPopoverButtons.count;
        for (let i = 0; i < countOfButtons; i++) {
            let popoverButton = workbenchPage.paginationPopoverButtons.nth(i);
            await t.expect(popoverButton.textContent).eql(popoverButtons[i], `The siblings menu button ${popoverButtons[i]} is displayed`);    
        }
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can see the quick navigation section to navigate between siblings under the scrolling content', async t => {
        //Open Working with Hashes section
        await t.click(workbenchPage.internalLinkWorkingWithHashes);
        //Verify the quick navigation section
        await t.expect(workbenchPage.enablementAreaPagination.visible).ok('The quick navigation section is displayed');
    });
