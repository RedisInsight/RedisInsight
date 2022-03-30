import { acceptLicenseTerms } from '../../../helpers/database';
import { MyRedisDatabasePage } from '../../../pageObjects';
import { commonUrl } from '../../../helpers/conf';
import { rte, env } from '../../../helpers/constants';
import { Chance } from 'chance';
import { join } from 'path';
import * as os from 'os';
import * as editJsonFile from 'edit-json-file';

const myRedisDatabasePage = new MyRedisDatabasePage();
const chance = new Chance();

const workingDirectory = join(os.homedir(), '.redisinsight-v2-stage');
const buildPath = `${workingDirectory}/content/build.json`;
const createRedisPath = `${workingDirectory}/content/create-redis.json`;
const buildFilePath = editJsonFile(buildPath);
const createRedisFilePath = editJsonFile(createRedisPath);
const timestampBeforeUpdate = buildFilePath.get("timestamp");
const timestampForEdit = timestampBeforeUpdate - 1;
const cloudValueForEdit = chance.word({ length: 10 });

//Edit json file values
createRedisFilePath.set('cloud.title', cloudValueForEdit);
createRedisFilePath.set('cloud.description', cloudValueForEdit);
createRedisFilePath.save();
buildFilePath.set('timestamp', timestampForEdit);
buildFilePath.save();

fixture `Automatically update information`
    .meta({type: 'critical_path'})
    .page(commonUrl)
    .beforeEach(async () => {
        await acceptLicenseTerms();
    })
test
    .meta({ rte: rte.standalone, env: env.desktop })
    ('Verify that user has the ability to update "Create free database" button without changing the app', async t => {
        const buildFilePathNew = editJsonFile(buildPath);
        const createRedisFilePathNew = editJsonFile(createRedisPath);
        //Check the promo button
        await t.expect(myRedisDatabasePage.promoButton.textContent).notContains(cloudValueForEdit, 'Promo button text is updated');
        //Check the json files are automatically updated
        const timestampAfterUpdate = await buildFilePathNew.get('timestamp');
        const cloudTitle = await createRedisFilePathNew.get('cloud.title');
        const cloudDescription = await createRedisFilePathNew.get('cloud.description');
        await t.expect(timestampAfterUpdate).notEql(timestampForEdit);
        await t.expect(cloudTitle).notEql(cloudValueForEdit);
        await t.expect(cloudDescription).notEql(cloudValueForEdit);
    });
