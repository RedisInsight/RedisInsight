import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage, MyRedisDatabasePage } from '../../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../../helpers/conf';
import {
    formatters
} from '../../../../test-data/formatters-data';
import { rte } from '../../../../helpers/constants';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const browserPage = new BrowserPage()

fixture `Decompressors`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseAPIRequests.deleteAllDatabasesApi();
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Delete database
        await databaseAPIRequests.deleteAllDatabasesApi();
    });

const compressorsList: string[] = [
    'GZIP',
    'LZ4',
    'SNAPPY',
    'ZSTD',
    'Brotli',
    'PHP GZCompress'
];

compressorsList.forEach(compressor => {
    test(`Verify that user can set decompressor for  ${compressor} DB`, async t => {
        const keys = [
            'list',
            'hash',
            'set',
            'zset',
            'string',
            'json',
            'stream'
        ]
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        // Edit alias of added database
        await databaseHelper.clickOnEditDatabaseByName(ossStandaloneConfig.databaseName);
        await t.click(myRedisDatabasePage.AddRedisDatabase.dataCompressorCheckbox);

        await myRedisDatabasePage.AddRedisDatabase.setCompressorValue(compressor);
        await t.click(myRedisDatabasePage.AddRedisDatabase.addRedisDatabaseButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);

        for (let i = 0; i < keys.length; i++) {
            for (const formatter of formatters) {
                await browserPage.openKeyDetails(`Comp:${compressor}:${formatter.format}:${keys[i]}`);
                await browserPage.selectFormatter(formatter.format);
                const value = await browserPage.stringValueAsJson.textContent;

                await t.expect(typeof value).eql('string', 'Value should be a string');
                await t.expect(/[^\u0000-\u007F]/.test(value)).ok('Value contains Unicode characters');
            };
        };
    });
});

