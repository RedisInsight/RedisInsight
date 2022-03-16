import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabase, deleteDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage, WorkbenchPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();

fixture `Cypher syntax at Workbench`
    .meta({type: 'regression'})
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabase(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        //Go to Workbench page
        await t.click(myRedisDatabasePage.workbenchButton);
    })
    .afterEach(async() => {
        //Drop database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
test
    .meta({ rte: rte.standalone })
    .after(async() => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    ('Verify that user can see popover “Use Cypher Syntax” when cursor is inside the query argument double/single quotes in the GRAPH command', async t => {
        const command = 'GRAPH.QUERY graph';
        //Type command and put the cursor inside
        await t.typeText(workbenchPage.queryInput, `${command} "query"`, { replace: true });
        await t.pressKey('left');
        //Check that user can see popover
        await t.expect(await workbenchPage.monacoWidget.textContent).contains('Use Cypher Editor', 'The user can see popover Use Cypher Syntax');
        await t.expect(await workbenchPage.monacoWidget.textContent).contains('Shift+Space', 'The user can see shortcut for Cypher Syntax');
        //Verify the popover with single quotes
        await t.typeText(workbenchPage.queryInput, `${command} ''`, { replace: true });
        await t.pressKey('left');
        await t.expect(await workbenchPage.monacoWidget.textContent).contains('Use Cypher Editor', 'The user can see popover Use Cypher Syntax');
    });
test
    .meta({ rte: rte.standalone })
    .after(async() => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    ('Verify that when user clicks on the “X” control or use keyboard shortcut “ESC” popover Editor is closed and changes are not saved', async t => {
        const command = 'GRAPH.QUERY graph "query"';
        //Type command and open the popover editor
        await t.typeText(workbenchPage.queryInput, command, { replace: true });
        await t.pressKey('left');
        await t.click(workbenchPage.monacoWidget);
        //Do some changes in the Editor and close by “X” control
        await t.typeText(workbenchPage.queryInput.nth(1), 'test', { replace: true });
        await t.click(workbenchPage.cancelButton);
        //Verify that editor is closed and changes are not saved
        let commandAfter = await workbenchPage.scriptsLines.textContent;
        await t.expect(workbenchPage.queryInput.nth(1).exists).notOk('The popover Editor is closed');
        await t.expect(commandAfter.replace(/\s/g, ' ')).eql(command, 'The changes are not saved from the Editor');
        //Re-open the Editor and do some changes and close by shortcut “ESC”
        await t.click(workbenchPage.monacoWidget);
        await t.typeText(workbenchPage.queryInput.nth(1), 'test', { replace: true });
        await t.pressKey('esc');
        //Verify that editor is closed and changes are not saved
        commandAfter = await workbenchPage.scriptsLines.textContent;
        await t.expect(commandAfter.replace(/\s/g, ' ')).eql(command, 'The changes are not saved from the Editor');
    });
test
    .meta({ rte: rte.standalone })
    .after(async() => {
        //Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })
    ('Verify that when user use keyboard shortcut “CTRL+ENTER” or clicks on the “V” control popover Editor is closed and changes are saved, converted to Redis syntax and inserted back to the Editor', async t => {
        let script = 'query';
        const command = 'GRAPH.QUERY graph';
        //Type command and open the popover editor
        await t.typeText(workbenchPage.queryInput, `${command} "${script}`, { replace: true });
        await t.pressKey('left');
        await t.click(workbenchPage.monacoWidget);
        //Do some changes in the Editor and click on the “V” control
        script = 'test';
        await t.pressKey('ctrl+a');
        await t.typeText(workbenchPage.queryInput.nth(1), script, { replace: true });
        await t.click(workbenchPage.applyButton);
        //Verify that editor is closed and changes are saved
        let commandAfter = await workbenchPage.scriptsLines.textContent;
        await t.expect(workbenchPage.queryInput.nth(1).exists).notOk('The popover Editor is closed');
        await t.expect(commandAfter.replace(/\s/g, ' ')).eql(`${command} "${script}"`, 'The changes are not saved from the Editor');
        //Re-open the Editor and do some changes and use keyboard shortcut “CTRL+ENTER”
        await t.click(workbenchPage.monacoWidget);
        script = 'test2';
        await t.pressKey('ctrl+a');
        await t.typeText(workbenchPage.queryInput.nth(1), 'test2', { paste: true, replace: true });
        await t.pressKey('ctrl+enter');
        //Verify that editor is closed and changes are not saved
        commandAfter = await workbenchPage.scriptsLines.textContent;
        await t.expect(commandAfter.replace(/\s/g, ' ')).eql(`${command} "${script}"`, 'The changes are not saved from the Editor');
    });
