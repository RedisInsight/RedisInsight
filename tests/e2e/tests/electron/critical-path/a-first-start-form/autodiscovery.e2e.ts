import { MyRedisDatabasePage } from '../../../../pageObjects';
import { commonUrl, workingDirectory } from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';
import {fixture, test} from 'testcafe'

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();


const standalonePorts = [8100, 8101, 8102, 8103, 12000];
const otherPorts = [28100, 8200];

// TODO: Other tests are messing up the state of this test for now seams like deleting the folder  will do as workaround
const cleanBeforeClientStarts = async () => {await Common.deleteFolderIfExists(workingDirectory)}
cleanBeforeClientStarts().then(async () => {

    fixture `Autodiscovery`
        .meta({ type: 'critical_path', rte: rte.none })
        .page(commonUrl)
        .beforeEach(async(t) => {

            await databaseHelper.acceptLicenseTerms();
        });

    test
        .after(async() => {
            // Delete all auto-discovered databases
            await databaseAPIRequests.deleteAllDatabasesApi();
        })('Verify that when users open application for the first time, they can see all auto-discovered Standalone DBs', async t => {
            // Check that standalone DBs have been added into the application
            const n = await myRedisDatabasePage.dbNameList.count;
            for(let k = 0; k < n; k++) {
                const name = await myRedisDatabasePage.dbNameList.nth(k).textContent;
                console.log(`AUTODISCOVERY ${k}: ${name}`);
            }
            // Verify that user can see all the databases automatically discovered with 127.0.0.1 host instead of localhost
            for(let i = 0; i < standalonePorts.length; i++) {
                await t.expect(myRedisDatabasePage.dbNameList.withExactText(`127.0.0.1:${standalonePorts[i]}`).exists).eql(true, `Standalone DBs is not found for ${standalonePorts[i]}`);
            }
            // Check that Sentinel and OSS cluster have not been added into the application
            for(let j = 0; j < otherPorts.length; j++) {
                await t.expect(myRedisDatabasePage.dbNameList.withExactText(`127.0.0.1:${otherPorts[j]}`).exists).notOk('Sentinel and OSS DBs');
            }
        });

})
