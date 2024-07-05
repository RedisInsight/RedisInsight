import { ClientFunction, t } from 'testcafe';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { RdiInstancePage } from '../../../../pageObjects/rdi-instance-page';
import { AddNewRdiParameters, RdiApiRequests } from '../../../../helpers/api/api-rdi';
import { cloudDatabaseConfig, commonUrl } from '../../../../helpers/conf';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import { RdiInstancesListPage } from '../../../../pageObjects/rdi-instances-list-page';
import {
    RdiPopoverOptions,
    RdiTemplateDatabaseType,
    RdiTemplatePipelineType,
    RedisOverviewPage,
    TextConnectionSection
} from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers';
import { goBackHistory } from '../../../../helpers/utils';


const myRedisDatabasePage = new MyRedisDatabasePage();
const rdiInstancePage = new RdiInstancePage();
const rdiInstancesListPage = new RdiInstancesListPage();
const rdiApiRequests = new RdiApiRequests();
const databaseHelper = new DatabaseHelper();

const rdiInstance: AddNewRdiParameters = {
    name: 'testInstance',
    url: 'https://54.175.165.214',
    username: 'username',
    password: 'v3rY$tronGPa33w0Rd3ECDb'
};

const getPageUrl = ClientFunction(() => window.location.href);

const filePath = path.join('..', '..', '..', '..', 'test-data', 'rdi', 'RDI_pipelineConfig.zip');

//skip the tests until rdi integration is added
fixture `Pipeline`
    .meta({ type: 'critical_path', feature: 'rdi' })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
        await rdiApiRequests.addNewRdiApi(rdiInstance);

    })
    .afterEach(async() => {
        await rdiApiRequests.deleteAllRdiApi();
    });

test.only('Verify that user can test connection', async() => {
    await myRedisDatabasePage.setActivePage(RedisOverviewPage.DataBase);
    await databaseHelper.autodiscoverRECloudDatabase(
        //cloudDatabaseConfig.accessKey,
        //cloudDatabaseConfig.secretKey
        'A4wddpkno553qruhpsd670y8axe94warws3gbjbw896iyjf6dfl',
        'S3xf5aiipy32nc9q7dyg8v4yhvf7x18i34euwilbcgrz02yjro5'
    );
    const [host, port] = (await myRedisDatabasePage.hostPort.textContent).split(':');
    //const password = cloudDatabaseConfig.databasePassword;

    const configData = {
        sources: {
            mysql: {
                type: 'cdc',
                logging: {
                    level: 'info'
                },
                connection: {
                    type: 'mysql',
                    host: 'localhost',
                    port: 3306,
                    user: 'root',
                    password: '1111',
                    database: 'mydatabase'
                }
            }
        },
        targets: {
            target: {
                type: 'redis',
                host,
                port,
                password: 'dd4oImrbinrNs1LXzKCtsnKjzLxZeaA2'
            }
        }
    };
    const config = yaml.dump(configData, { indent: 2 });

    //fs.writeFileSync('config.yaml', yamlString, 'utf8');
    console.log(JSON.stringify(config));
    await myRedisDatabasePage.setActivePage(RedisOverviewPage.Rdi);
    await rdiInstancesListPage.clickRdiByName(rdiInstance.name);
    await rdiInstancePage.selectStartPipelineOption(RdiPopoverOptions.Pipeline);
    await t.click(rdiInstancePage.templateCancelButton);

    await t.click(rdiInstancePage.configurationInput);
    const lines = config.split('\n');
    const maxLevelDepth = 3;
    const targetName = 'target';

    await rdiInstancePage.MonacoEditor.insertTextByLines(rdiInstancePage.configurationInput, lines, maxLevelDepth);
    await t.click(rdiInstancePage.textConnectionBtn);
    await rdiInstancePage.TestConnectionPanel.expandOrCollapseSection(TextConnectionSection.Success, true);

    await t.expect(await rdiInstancePage.TestConnectionPanel.targetName.textContent).eql(targetName);

    await t.click(rdiInstancePage.RdiHeader.uploadFromFileButton);
    await rdiInstancePage.RdiHeader.uploadPipeline(filePath);
    await t.click(rdiInstancePage.okUploadPipelineBtn);
    await t.click(rdiInstancePage.textConnectionBtn);

});
test('Verify that link on configuration is valid', async() => {

    const link = 'https://docs.redis.com/latest/rdi/quickstart/';
    // Verify the link
    await myRedisDatabasePage.setActivePage(RedisOverviewPage.Rdi);
    await rdiInstancesListPage.clickRdiByName(rdiInstance.name);
    await t.click(rdiInstancePage.PipelineManagementPanel.configurationTab);
    await rdiInstancePage.selectStartPipelineOption(RdiPopoverOptions.Server);
    await t.click(rdiInstancePage.configurationLink);
    await t.expect(getPageUrl()).eql(link, 'Build from homebrew page is not valid');
    await goBackHistory();
});

test('Verify that user can insert template', async() => {
    const disabledAttribute = 'isDisabled';
    const defaultValue = 'Ingest';
    const templateWords = 'type: redis';
    // should be empty config
    await myRedisDatabasePage.setActivePage(RedisOverviewPage.Rdi);
    await rdiInstancesListPage.clickRdiByName(rdiInstance.name);
    await t.click(rdiInstancePage.PipelineManagementPanel.configurationTab);
    await rdiInstancePage.selectStartPipelineOption(RdiPopoverOptions.File);
    await t.expect(rdiInstancePage.templateApplyButton.visible).ok('the template popover is not expanded');
    const buttonClass = rdiInstancePage.templateApplyButton.getAttribute('class');
    await t.expect(buttonClass).notContains(disabledAttribute, 'Apply button is disabled');
    await t.click(rdiInstancePage.templateCancelButton);
    await t.expect(rdiInstancePage.templateApplyButton.exists).notOk('the template popover is not closed');

    await t.click(rdiInstancePage.templateButton);
    await t.expect(rdiInstancePage.templateApplyButton.visible).ok('the template popover is not expanded');
    await t.expect(rdiInstancePage.pipelineDropdown.textContent).eql(defaultValue, 'the default value is set incorrectly');
    await rdiInstancePage.setTemplateDropdownValue(RdiTemplatePipelineType.Ingest, RdiTemplateDatabaseType.MySql);

    //verify uniq templates words - should be undated when templates are added
    const enteredText = await rdiInstancePage.MonacoEditor.getTextFromMonaco();
    await t.expect(enteredText).contains(templateWords, 'template is incorrect');

    await t.click(rdiInstancePage.templateButton);
    await t.expect(buttonClass).contains(disabledAttribute, 'Apply button is active');
    await t.expect(rdiInstancePage.pipelineDropdown.textContent).eql('Ingest', 'the value is set incorrectly');
    await t.expect(rdiInstancePage.databaseDropdown.textContent).eql('MySQL', 'the default value is set incorrectly');
});
