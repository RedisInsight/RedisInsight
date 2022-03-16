// import { acceptLicenseTerms } from '../../../helpers/database';
import { MyRedisDatabasePage } from '../../../pageObjects';
import {
    commonUrl
} from '../../../helpers/conf';
import {env, rte} from '../../../helpers/constants';

const myRedisDatabasePage = new MyRedisDatabasePage();
// const userAgreementPage = new UserAgreementPage();
const ports = [8101, 12000, 8102, 8103, 8101];

fixture.only `Autodiscovery`
    .meta({ type: 'regression' })
    .page(commonUrl)
    // .before(async() => {
    //     if (await userAgreementPage.userAgreementsPopup.exists) {
    //         await acceptLicenseTerms();
    //     }
    // })
test
    .meta({ env: env.desktop, rte: rte.none })
    .after(async() => {
        //Delete all auto-discovered databases
        // await myRedisDatabasePage.deleteAllDatabases();
    })
    ('Verify that when users open application for the first time, they can see all auto-discoveried Standalone DBs', async t => {
        //Check that all DBs from e2e container are added automatically
        //Since it is not possible to add order of running test or to delete redisinsight.db file, check DBs from container that should be added during the first test run
        const n = await myRedisDatabasePage.dbNameList.count;
        for(let j = 0; j < n; j++) {
            const name = await myRedisDatabasePage.dbNameList.nth(j).textContent;
            console.log(`Database name ${j}: ${name}`);
        }
        for(let i = 0; i < ports.length; i++) {
            await t.expect(myRedisDatabasePage.dbNameList.withExactText(`localhost:${ports[i]}`).exists).ok();
        }
    });
