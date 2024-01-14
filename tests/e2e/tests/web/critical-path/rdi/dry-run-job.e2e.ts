import { t } from 'testcafe';
import { RdiInstancePage } from '../../../../pageObjects/rdi-instance-page';
import { RdiInstance } from '../../../../pageObjects/components/myRedisDatabase/add-rdi-instance';
import { updateColumnValueInDBTable } from '../../../../helpers/database-scripts';

const rdiInstancePage = new RdiInstancePage();
export const commonUrl = process.env.COMMON_URL || 'http://localhost:8080/integrate';
const rdiTable = 'rdi';

const rdiInstance: RdiInstance = {
    alias: 'testInstance',
    url: 'url',
    username: 'username',
    password: 'password',
    version: '1.2'
};
//skip the tests until rdi integration is added

fixture.skip `Rdi dry run job`
    .meta({ type: 'critical_path' })
    // it will be removed
    .page(commonUrl)
    .beforeEach(async() => {
        await t.maximizeWindow();

    })
    .afterEach(async() => {
        // delete instances via UI
        await rdiInstancePage.deleteAllInstance();
    });
test('Verify that user can add and remove RDI', async() => {
    const instanceId = 'testId'
    
    await rdiInstancePage.addRdi(rdiInstance);
    updateColumnValueInDBTable(rdiTable, 'id', instanceId);


});
