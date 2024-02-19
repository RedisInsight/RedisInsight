import { t } from 'testcafe';
import { RdiInstancePage } from '../../../../pageObjects/rdi-instance-page';
import { AddNewRdiParameters, RdiApiRequests } from '../../../../helpers/api/api-rdi';
import { commonUrl } from '../../../../helpers/conf';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import { RedisOverviewPage } from '../../../../helpers/constants';
import { RdiInstancesListPage } from '../../../../pageObjects/rdi-instances-list-page';
import { BrowserActions } from '../../../../common-actions/browser-actions';

const rdiInstancePage = new RdiInstancePage();
const rdiApiRequests = new RdiApiRequests();
const myRedisDatabasePage = new MyRedisDatabasePage();
const rdiInstancesListPage = new RdiInstancesListPage();
const browserActions = new BrowserActions();

const rdiInstance: AddNewRdiParameters = {
    name: 'testInstance',
    url: 'http://localhost:4000',
    username: 'username',
    password: 'password'
};

//skip the tests until rdi integration is added
fixture `Add job`
    .meta({ type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async() => {
        await t.maximizeWindow();
        await myRedisDatabasePage.setActivePage(RedisOverviewPage.Rdi);
        await rdiApiRequests.addNewRdiApi(rdiInstance);
        await rdiInstancesListPage.reloadPage();
        await rdiInstancesListPage.clickRdiByName(rdiInstance.name);

    })
    .afterEach(async() => {
        await rdiApiRequests.deleteAllRdiApi();
    });
test('Verify that user can add, edit and delete job', async() => {
    const jobName = 'testJob';
    const jobName2 = 'testJob2';

    await t.click(rdiInstancePage.addJobBtn);

    const placeholder =  await rdiInstancePage.jobNameInput.getAttribute('placeholder');

    await t.expect(placeholder).eql('Enter job name');

    await t
        .expect(rdiInstancePage.applyJobNameBtn.hasAttribute('disabled')).ok('the button is not disabled');
    await t.hover(rdiInstancePage.applyJobNameBtn);
    await browserActions.verifyTooltipContainsText('Job name is required', true);

    await t.click(rdiInstancePage.cancelJobNameBtn);
    await rdiInstancePage.addJob(jobName);

    const elementItem = await rdiInstancePage.jobItem.count;
    await t.expect(elementItem).gt(0, 'The job is not added');

    await t.click(rdiInstancePage.addJobBtn);
    await t.typeText(rdiInstancePage.jobNameInput, jobName);
    await t
        .expect(rdiInstancePage.applyJobNameBtn.hasAttribute('disabled')).ok('the button is not disabled');
    await t.hover(rdiInstancePage.applyJobNameBtn);
    await browserActions.verifyTooltipContainsText('This job name is already in use', true);
    await t.click(rdiInstancePage.cancelJobNameBtn);

    await rdiInstancePage.addJob(jobName2);
    let elementItem2 = await rdiInstancePage.jobItem.count;
    await t.expect(elementItem + 1).eql(elementItem2, 'the 2d job has not be added');

    await rdiInstancePage.deleteJobByName(jobName2);
    elementItem2 = await rdiInstancePage.jobItem.count;
    await t.expect(elementItem).eql(elementItem2, 'the 2d job has not be deleted');

    await rdiInstancePage.editJobByName(jobName, jobName2);
    await rdiInstancePage.openJobByName(jobName2);

    await t.expect(rdiInstancePage.jobsPipelineTitle.textContent).eql(jobName2);
});

