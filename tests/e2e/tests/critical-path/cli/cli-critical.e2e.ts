import { Common } from '../../../helpers/common';
import { rte } from '../../../helpers/constants';
import { BrowserPage, CliPage } from '../../../pageObjects';
import { 
    acceptLicenseTermsAndAddDatabaseApi, 
    acceptLicenseTermsAndAddOSSClusterDatabase
} from '../../../helpers/database';
import {
    commonUrl,
    ossClusterConfig,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { Chance } from 'chance';
import { deleteOSSClusterDatabaseApi, deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const cliPage = new CliPage();
const common = new Common();
const browserPage = new BrowserPage();
const chance = new Chance();

const pairsToSet = common.createArrayPairsWithKeyValue(4);
const MAX_AUTOCOMPLETE_EXECUTIONS = 100;
let keyName = chance.word({ length: 10 });
let value = chance.natural({ length: 5 });

fixture `CLI critical`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async () => {
        //Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })
test
    .meta({ rte: rte.ossCluster })
    .before(async () => {
        await acceptLicenseTermsAndAddOSSClusterDatabase(ossClusterConfig, ossClusterConfig.ossClusterDatabaseName);
    })
    .after(async () => {
        //Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteOSSClusterDatabaseApi(ossClusterConfig);
    })
    ('Verify that user is redirected to another node when he works in CLI with OSS Cluster', async t => {
        keyName = chance.word({ length: 10 });
        //Open CLI
        await t.click(cliPage.cliExpandButton);
        //Add key from CLI
        for ([keyName, value] of pairsToSet) {
            await t.typeText(cliPage.cliCommandInput, `SET ${keyName} ${value}`);
            await t.pressKey('enter');
        }
        //Check that user is redirected
        await t.expect(await cliPage.cliArea.textContent).contains('Redirected to', 'User command was redirected to another node');
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that Redis returns error if command is not correct when user works with CLI', async t => {
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
test
    .meta({ rte: rte.standalone })
    ('Verify that user can scroll commands using "Tab" in CLI & execute it', async t => {
        const commandToAutoComplete = 'INFO';
        const commandStartsWith = 'I';
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
    .meta({ rte: rte.standalone })
    ('Verify that when user enters in CLI RediSearch/JSON commands (FT.CREATE, FT.DROPINDEX/JSON.GET, JSON.DEL), he can see hints with arguments', async t => {
        const commandHints =[
            'index [data_type] [prefix] [filter] [default_lang] [lang_attribute] [default_score] [score_attribute] [payload_attribute] [maxtextfields] [seconds] [nooffsets] [nohl] [nofields] [nofreqs] [stopwords] [skipinitialscan] schema field [field ...]',
            'index [delete docs]',
            'key [indent] [newline] [space] [paths [paths ...]]',
            'key [path]'
        ];
        const commands = [
            'FT.CREATE',
            'FT.DROPINDEX',
            'JSON.GET',
            'JSON.DEL'
        ];
        //Open CLI
        await t.click(cliPage.cliExpandButton);
        //Enter commands and check hints with arguments
        for(let command of commands) {
            await t.typeText(cliPage.cliCommandInput, command, { replace: true });
            await t.expect(cliPage.cliCommandAutocomplete.textContent).eql(commandHints[commands.indexOf(command)], `The hints with arguments for command ${command}`);
        }
    });
test
    .meta({ rte: rte.standalone })
    ('Verify that user can type AI command in CLI and see agruments in hints from RedisAI commands.json', async t => {
        const commandHints = 'key [META] [BLOB]';
        const command = 'ai.modelget';
        //Open CLI and type AI command
        await t.click(cliPage.cliExpandButton);
        await t.typeText(cliPage.cliCommandInput, command, { replace: true });
        //Verify the hints
        await t.expect(cliPage.cliCommandAutocomplete.textContent).eql(commandHints, `The hints with arguments for command ${command}`);
    });
