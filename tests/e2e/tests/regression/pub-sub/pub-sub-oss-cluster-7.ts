import {
    acceptLicenseTerms
} from '../../../helpers/database';
import { MyRedisDatabasePage, PubSubPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig, ossClusterConfig } from '../../../helpers/conf';
import { rte, env } from '../../../helpers/constants';
import { verifyMessageDisplayingInPubSub } from '../../../helpers/pub-sub';
import {
    addNewOSSClusterDatabaseApi, addNewStandaloneDatabaseApi,
    deleteOSSClusterDatabaseApi, deleteStandaloneDatabaseApi
} from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const pubSubPage = new PubSubPage();
const common = new Common();

fixture `PubSub OSS Cluster 7 tests`
    .meta({ env: env.web, type: 'regression' })
    .page(commonUrl);

test
    .before(async t => {
        await acceptLicenseTerms();
        await addNewOSSClusterDatabaseApi(ossClusterConfig);
        await common.reloadPage();
        await myRedisDatabasePage.clickOnDBByName(ossClusterConfig.ossClusterDatabaseName);
        await t.click(myRedisDatabasePage.NavigationPanel.pubSubButton);
    })
    .after(async() => {
        await deleteOSSClusterDatabaseApi(ossClusterConfig);
    })
    .meta({ rte: rte.ossCluster })('Verify that SPUBLISH message is displayed for OSS Cluster 7 database', async t => {
        await t.expect(pubSubPage.ossClusterEmptyMessage.exists).ok('SPUBLISH message not displayed');
        // Verify that user can see published messages for OSS Cluster 7
        await t.click(pubSubPage.subscribeButton);
        // Publish different messages
        await pubSubPage.Cli.sendCommandInCli('50 publish channel oss_cluster_message');
        await verifyMessageDisplayingInPubSub('oss_cluster_message', true);
        // Verify that SPUBLISHED messages are not displayed for OSS Cluster 7
        await pubSubPage.Cli.sendCommandInCli('10 spublish channel oss_cluster_message_spublish');
        await verifyMessageDisplayingInPubSub('oss_cluster_message_spublish', false);
    });
test
    .before(async t => {
        await acceptLicenseTerms();
        await addNewStandaloneDatabaseApi(ossStandaloneConfig);
        await common.reloadPage();
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await t.click(myRedisDatabasePage.NavigationPanel.pubSubButton);
    })
    .after(async() => {
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })
    .meta({ rte: rte.standalone })('Verify that SPUBLISH message is not displayed for other databases expect OSS Cluster 7', async t => {
        await t.expect(pubSubPage.ossClusterEmptyMessage.exists).notOk('No SPUBLISH message still displayed');
        // Verify that user can't see published messages for Standalone DB
        await t.click(pubSubPage.subscribeButton);
        await pubSubPage.Cli.sendCommandInCli('10 spublish channel oss_cluster_message_spublish');
        await verifyMessageDisplayingInPubSub('oss_cluster_message_spublish', false);
    });
