import {MyRedisDatabasePage} from '../../../pageObjects';
import {
    commonUrl
} from '../../../helpers/conf';
import {env, rte} from '../../../helpers/constants';
import {acceptLicenseTerms} from '../../../helpers/database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const standalonePorts = [8100, 8101, 8102, 8103, 12000];
const otherPorts = [28100, 8200];

fixture `Autodiscovery`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTerms();
    });
test
    .meta({ env: env.desktop, rte: rte.none })
    .after(async() => {
        // Delete all auto-discovered databases
        for(let i = 0; i < standalonePorts.length; i++) {
            await myRedisDatabasePage.deleteDatabaseByName(`127.0.0.1:${standalonePorts[i]}`);
        }
    })('Verify that when users open application for the first time, they can see all auto-discovered Standalone DBs', async t => {
        // Check that standalone DBs have been added into the application
        const n = await myRedisDatabasePage.dbNameList.count;
        for(let k = 0; k < n; k++) {
            const name = await myRedisDatabasePage.dbNameList.nth(k).textContent;
            console.log(`AUTODISCOVERY ${k}: ${name}`);
        }
        // Verify that user can see all the databases automatically discovered with 127.0.0.1 host instead of localhost
        for(let i = 0; i < standalonePorts.length; i++) {
            await t.expect(myRedisDatabasePage.dbNameList.withExactText(`127.0.0.1:${standalonePorts[i]}`).exists).ok('Standalone DBs');
        }
        // Check that Sentinel and OSS cluster have not been added into the application
        for(let j = 0; j < otherPorts.length; j++) {
            await t.expect(myRedisDatabasePage.dbNameList.withExactText(`127.0.0.1:${otherPorts[j]}`).exists).notOk('Sentinel and OSS DBs');
        }
    });
