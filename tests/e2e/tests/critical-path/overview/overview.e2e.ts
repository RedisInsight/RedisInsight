import { MyRedisDatabasePage, BrowserPage, CliPage, OverviewPage } from '../../../pageObjects';
import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddOSSClusterDatabase } from '../../../helpers/database';
import { commonUrl, ossClusterConfig } from '../../../helpers/conf';
import { deleteOSSClusterDatabaseApi, getClusterNodesApi } from '../../../helpers/api/api-database';
import { Selector } from 'testcafe';

const overviewPage = new OverviewPage();
const myRedisDatabasePage = new MyRedisDatabasePage();

const headerColumns = {
    'Type': 'OSS Cluster',
    'Version': '7.0.0',
    'User': 'Default'
};

fixture `Overview`
    .meta({ type: 'critical_path', rte: rte.ossCluster })
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddOSSClusterDatabase(ossClusterConfig, ossClusterConfig.ossClusterDatabaseName);
        await t.click(myRedisDatabasePage.analysisPageButton);
    })
    .afterEach(async() => {
        await deleteOSSClusterDatabaseApi(ossClusterConfig);
    });
test('Overview tab header for OSS Cluster', async t => {
    const uptime = /[1-9][0-9]\s|[0-9]\smin|[1-9][0-9]\smin/;
    // Verify that user see "Overview" tab by default for OSS Cluster
    await t.expect(overviewPage.overviewTab.withAttribute('aria-selected', 'true').exists).ok('The Overview tab not opened');
    // Verify that user see "Overview" header with OSS Cluster info
    for (const key in headerColumns) {
        let columnSelector = Selector(`[data-testid=cluster-details-item-${key}]`);
        await t.expect(columnSelector.textContent).contains(`${headerColumns[key]}`, `Cluster detail ${key} is incorrect`);
    }
    // Verify that Uptime is displayed as time in seconds or minutes from start
    await t.expect(overviewPage.clusterDetailsUptime.textContent).match(uptime, 'Uptime value is not correct');
});
test('Primary node statistics table displaying', async t => {
    // Verify nodes in header column equal to rows
    const nodes = await getClusterNodesApi(ossClusterConfig);
    const nodesNumberInHeader = parseInt((await overviewPage.tableHeaderCell.nth(0).textContent).match(/\d+/)![0]);
    await t.expect(await overviewPage.getPrimaryNodesCount()).eql(nodesNumberInHeader, 'Primary nodes in table are not displayed');
    // Verify that all nodes from BE response are displayed in table
    for (let node of nodes) {
        await t.expect(overviewPage.tableRow.nth(nodes.indexOf(node)).textContent).contains(node, `Node ${node} is not displayed in table`);
    }
});
 