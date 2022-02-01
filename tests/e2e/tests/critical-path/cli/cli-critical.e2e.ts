import { addOSSClusterDatabase, addNewStandaloneDatabase } from '../../../helpers/database';
import { Common } from '../../../helpers/common';
import {
    MyRedisDatabasePage,
    UserAgreementPage,
    CliPage,
    AddRedisDatabasePage
} from '../../../pageObjects';
import {
    commonUrl,
    ossClusterConfig,
    ossStandaloneConfig
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const cliPage = new CliPage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const common = new Common();

const pairsToSet = common.createArrayPairsWithKeyValue(4);
const MAX_AUTOCOMPLETE_EXECUTIONS = 100;

fixture `CLI critical`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', {timeout: 20000});
    })
//skipped due the bug RI-2156
test.skip
    .meta({ rte: 'oss-cluster' })
    .after(async t => {
        //Clear database
        await t.typeText(cliPage.cliCommandInput, 'FLUSHDB');
        await t.pressKey('enter');
    })
    ('Verify that user is redirected to another node when he works in CLI with OSS Cluster', async t => {
        await addOSSClusterDatabase(ossClusterConfig);
        await myRedisDatabasePage.clickOnDBByName(ossClusterConfig.ossClusterDatabaseName);
        //Open CLI
        await t.click(cliPage.cliExpandButton);
        //Add key from CLI
        for (const [key, value] of pairsToSet) {
            await t.typeText(cliPage.cliCommandInput, `SET ${key} ${value}`);
            await t.pressKey('enter');
        }
        //Check that the key is added
        const redirectedText = cliPage.cliOutputResponseSuccess.withText('Redirected to')
        await t.expect(redirectedText.exists).ok('User command was redirected to another node');
    });
test
    .meta({ rte: 'standalone' })
    ('Verify that Redis returns error if command is not correct when user works with CLI', async t => {
        await addNewStandaloneDatabase(ossStandaloneConfig);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //Open CLI
        await t.click(cliPage.cliExpandButton);

        await t.typeText(cliPage.cliCommandInput, 'SET key');
        await t.pressKey('enter');
        //Check error
        const errWrongArgs = cliPage.cliOutputResponseFail.withText('ERR wrong number of arguments for \'set\' command')
        await t.expect(errWrongArgs.exists).ok('Error with wrong number of arguments was shown');

        await t.typeText(cliPage.cliCommandInput, 'lorem');
        await t.pressKey('enter');
        //Check error
        const errWrongCmnd = cliPage.cliOutputResponseFail.withText('ERR unknown command')
        await t.expect(errWrongCmnd.exists).ok('Error unknown command was shown');
    });
    test('Verify that user can scroll commands using "Tab" in CLI & execute it', async t => {
        const commandToAutoComplete = 'INFO';
        const commandStartsWith = 'I';
        await addNewStandaloneDatabase(ossStandaloneConfig);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //Open CLI
        await t.click(cliPage.cliExpandButton);
        await t.typeText(cliPage.cliCommandInput, commandStartsWith);
        //Press tab while we won't find 'INFO' command
        //Avoid endless cycle
        let operationsCount = 0;
        while (await cliPage.cliCommandInput.textContent !== commandToAutoComplete && operationsCount < MAX_AUTOCOMPLETE_EXECUTIONS) {
            await t.pressKey('tab');
            ++operationsCount;
        }
        await t.pressKey('enter');
        //Check that command was executed and user got success result
        await t.expect(cliPage.cliOutputResponseSuccess.exists).ok('Command from autocomplete was found & executed');
    });
test
    .meta({ rte: 'standalone' })
    ('Verify that when user enters in CLI RediSearch/JSON commands (FT.CREATE, FT.DROPINDEX/JSON.GET, JSON.DEL), he can see hints with arguments', async t => {
        const commandHints =[
            'index [ON HASH|JSON] [PREFIX count prefix [prefix ...]] [LANGUAGE default_lang] [LANGUAGE_FIELD lang_attribute] [SCORE default_score] [SCORE_FIELD score_attribute] [PAYLOAD_FIELD payload_attribute] [MAXTEXTFIELDS] [TEMPORARY seconds] [NOOFFSETS] [NOHL] [NOFIELDS] [NOFREQS] [count stopword [stopword ...]] SCHEMA field_name [AS alias] TEXT|TAG|NUMERIC|GEO [SORTABLE [UNF]] [NOINDEX]',
            'index [DD]',
            'key [INDENT indent] [NEWLINE newline] [SPACE space] [paths [paths ...]]',
            'key [path]'
        ];
        const commands = [
            'FT.CREATE',
            'FT.DROPINDEX',
            'JSON.GET',
            'JSON.DEL'
        ];
        await addNewStandaloneDatabase(ossStandaloneConfig);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //Open CLI
        await t.click(cliPage.cliExpandButton);
        //Enter commands and check hints with arguments
        for(let command of commands) {
            await t.typeText(cliPage.cliCommandInput, command, { replace: true });
            await t.expect(cliPage.cliCommandAutocomplete.textContent).eql(commandHints[commands.indexOf(command)], `The hints with arguments for command ${command}`);
        }
    });
test
    .meta({ rte: 'standalone' })
    ('Verify that user can type AI command in CLI and see agruments in hints from RedisAI commands.json', async t => {
        const commandHints = 'key [META] [BLOB]';
        const command = 'ai.modelget';
        await addNewStandaloneDatabase(ossStandaloneConfig);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //Open CLI and type AI command
        await t.click(cliPage.cliExpandButton);
        await t.typeText(cliPage.cliCommandInput, command, { replace: true });
        //Verify the hints
        await t.expect(cliPage.cliCommandAutocomplete.textContent).eql(commandHints, `The hints with arguments for command ${command}`);
    });
