import { ExploreTabs, rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { MyRedisDatabasePage, WorkbenchPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

fixture `Default scripts area at Workbench`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async t => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
        // Go to Workbench page
        await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
    })
    .afterEach(async() => {
        // Delete database
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can see the [Manual] option in the Enablement area', async t => {
    const optionsForCheck = [
        'Manual',
        'List the Indices',
        'Index info',
        'Search',
        'Aggregate'
    ];

    // Remember the options displayed in the area
    const countOfOptions = await workbenchPage.preselectButtons.count;
    const displayedOptions: string[] = [];
    for(let i = 0; i < countOfOptions; i++) {
        displayedOptions.push(await workbenchPage.preselectButtons.nth(i).textContent);
    }
    // Verify the options in the area
    for(let i = 0; i < countOfOptions; i++) {
        await t.expect(displayedOptions[i]).eql(optionsForCheck[i], `Option ${optionsForCheck} is not in the Enablement area`);
    }
});
test('Verify that user can see saved article in Enablement area when he leaves Workbench page and goes back again', async t => {
    await workbenchPage.InsightsPanel.togglePanel(true);
    const tutorials = await workbenchPage.InsightsPanel.setActiveTab(ExploreTabs.Explore);
    await t.click(tutorials.documentButtonInQuickGuides);
    await t.expect(tutorials.internalLinkWorkingWithHashes.visible).ok('The working with hachs link is not visible', { timeout: 5000 });
    // Open Working with Hashes section
    await t.click(tutorials.internalLinkWorkingWithHashes);
    // Check the button from Hash page is visible
    await tutorials.runBlockCode('Create');
    let selector = await tutorials.getRunSelector('Create');
    await t.expect(selector.visible).ok('The end of the page is not visible');
    // Go to Browser page
    await t.click(myRedisDatabasePage.NavigationPanel.browserButton);
    // Go back to Workbench page
    await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
    // Verify that the same article is opened in Enablement area
    selector = await tutorials.getRunSelector('Create');
    await t.expect(selector.visible).ok('The end of the page is not visible');
    // Go to list of DBs page
    await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
    // Go back to active DB again
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    // Check that user is on Workbench page and "Working with Hashes" page is displayed
    selector = await tutorials.getRunSelector('Create');
    await t.expect(selector.visible).ok('The end of the page is not visible');
});
//skipped due the issue RI-2384
test.skip('Verify that user can see saved scroll position in Enablement area when he leaves Workbench page and goes back again', async t => {
    // Open Working with Hashes section
    await workbenchPage.InsightsPanel.togglePanel(true);
    const tutorials = await workbenchPage.InsightsPanel.setActiveTab(ExploreTabs.Explore);
    await t.click(tutorials.documentButtonInQuickGuides);
    await t.click(tutorials.internalLinkWorkingWithHashes);
    // Evaluate the last button in Enablement Area
    const buttonsQuantity = await workbenchPage.preselectButtons.count;
    const lastButton = workbenchPage.preselectButtons.nth(buttonsQuantity - 1);
    // Scroll to the very bottom of the page
    await t.scrollIntoView(lastButton);
    // Check the scroll position
    const scrollPosition = await workbenchPage.scrolledEnablementArea.scrollTop;
    // Go to Browser page
    await t.click(myRedisDatabasePage.NavigationPanel.browserButton);
    // Go back to Workbench page
    await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
    // Check that scroll position is saved
    await t.expect(await workbenchPage.scrolledEnablementArea.scrollTop).eql(scrollPosition, 'The scroll position status is incorrect');
    // Go to list of DBs page
    await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
    // Go back to active DB again
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    // Check that scroll position is saved
    await t.expect(await workbenchPage.scrolledEnablementArea.scrollTop).eql(scrollPosition, 'Scroll position is not correct');
});
test('Verify that user can see the siblings menu by clicking on page counter element between Back and Next buttons', async t => {
    const popoverButtons = [
        'Introduction',
        'Working with Hashes',
        'Working with JSON',
        'Learn More'
    ];

    // Open Working with Hashes section and click on the on page counter
    await workbenchPage.InsightsPanel.togglePanel(true);
    const tutorials = await workbenchPage.InsightsPanel.setActiveTab(ExploreTabs.Explore);
    await t.click(tutorials.documentButtonInQuickGuides);
    await t.expect(tutorials.internalLinkWorkingWithHashes.visible).ok('The working with hachs link is not visible', { timeout: 5000 });
    await t.click(tutorials.internalLinkWorkingWithHashes);
    // Verify that user can see the quick navigation section to navigate between siblings under the scrolling content
    await t.expect(tutorials.enablementAreaPagination.visible).ok('The quick navigation section is not displayed');

    await t.click(tutorials.enablementAreaPagination);
    // Verify the siblings menu
    await t.expect(tutorials.enablementAreaPaginationPopover.visible).ok('The siblings menu is not displayed');
    const countOfButtons = await tutorials.paginationPopoverButtons.count;
    for (let i = 0; i < countOfButtons; i++) {
        const popoverButton = tutorials.paginationPopoverButtons.nth(i);
        await t.expect(popoverButton.textContent).eql(popoverButtons[i], `The siblings menu button ${popoverButtons[i]} is not displayed`);
    }
});
test('Verify that the same type of content is supported in the “Tutorials” as in the “Quick Guides”', async t => {
    const tutorialsContent = [
        'Working with JSON',
        'Vector Similarity Search',
        'Redis for time series',
        'Probabilistic data structures'
    ];
    const command = 'HSET bikes:10000  ';

    // Verify the redis stack links
    await workbenchPage.InsightsPanel.togglePanel(true);
    const tutorials = await workbenchPage.InsightsPanel.setActiveTab(ExploreTabs.Explore);
    await t.click(tutorials.redisStackTutorialsButton);
    const linksCount = await tutorials.redisStackLinks.count;
    for (let i = 0; i < linksCount; i++) {
        await t.expect(tutorials.redisStackLinks.nth(i).textContent).eql(tutorialsContent[i], `The link ${tutorialsContent[i]} is in the Enablement area`);
    }
    // Verify the load script to Editor
    await t.click(tutorials.vectorSimilitaritySearchButton);
    // Verify that user can see the pagination for redis stack pages in Tutorials
    await t.expect(tutorials.enablementAreaPagination.visible).ok('The user can not see the pagination for redis stack pages');
    await t.expect(tutorials.nextPageButton.visible).ok('The user can not see the next page for redis stack pages');
    await t.expect(tutorials.prevPageButton.visible).ok('The user can not see the prev page for redis stack pages');

    await t.expect(workbenchPage.queryInputScriptArea.textContent).eql('', 'The editor is not empty');
});
