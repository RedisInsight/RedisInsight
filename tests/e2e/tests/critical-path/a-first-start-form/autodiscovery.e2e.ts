import {MyRedisDatabasePage} from '../../../pageObjects';
import {
    commonUrl
} from '../../../helpers/conf';
import {env, rte} from '../../../helpers/constants';

const myRedisDatabasePage = new MyRedisDatabasePage();
const standalonePorts = [8100, 8101, 8102, 8103, 12000];
const otherPorts = [28100, 8200];

fixture `Autodiscovery`
    .meta({ type: 'regression' })
    .page(commonUrl)
test
    .meta({ env: env.desktop, rte: rte.none })
    .after(async() => {
        // Delete all auto-discovered databases
        await myRedisDatabasePage.deleteAllDatabases();
    })
    ('Verify that when users open application for the first time, they can see all auto-discovered Standalone DBs', async t => {
        const n = await myRedisDatabasePage.dbNameList.count;
        for(let j = 0; j < n; j++) {
            const name = await myRedisDatabasePage.dbNameList.nth(j).textContent;
            console.log(`Database name ${j}: ${name}`);
        }
        for(let i = 0; i < standalonePorts.length; i++) {
            await t.expect(myRedisDatabasePage.dbNameList.withExactText(`localhost:${standalonePorts[i]}`).exists).ok();
        }
        for(let j = 0; j < otherPorts.length; j++) {
            await t.expect(myRedisDatabasePage.dbNameList.withExactText(`localhost:${otherPorts[j]}`).exists).notOk();
        }
    });
