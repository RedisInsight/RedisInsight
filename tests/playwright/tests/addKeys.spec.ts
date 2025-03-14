// import { rte } from '../helpers/constants'
// import { Common } from '../helpers/common'
// // import { DatabaseHelper } from '../../../../helpers/database';
// // import { BrowserPage } from '../../../../pageObjects';
// // import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
//
// // import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
// // import { APIKeyRequests } from '../../../../helpers/api/api-keys';
// //
// // const browserPage = new BrowserPage();
// // const databaseHelper = new DatabaseHelper();
// // const databaseAPIRequests = new DatabaseAPIRequests();
// // const apiKeyRequests = new APIKeyRequests();
// //
// let keyName = Common.generateWord(10) //done
//
// fixture `Add keys` //NA
//     .meta({ type: 'smoke', rte: rte.standalone })
//     .page(commonUrl)
//     .beforeEach(async() => {
//         await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
//     })
//     .afterEach(async() => {
//         // Clear and delete database
//         await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
//         await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
//     });
// test('Verify that user can add Hash Key', async t => {
//     keyName = Common.generateWord(10);
//     // Add Hash key
//     await browserPage.addHashKey(keyName);
//     // Check the notification message
//     const notification = browserPage.Toast.toastHeader.textContent;
//     await t.expect(notification).contains('Key has been added', 'The notification not displayed');
//     // Check that new key is displayed in the list
//     await browserPage.searchByKeyName(keyName);
//     const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
//     await t.expect(isKeyIsDisplayedInTheList).ok('The Hash key is not added');
// });
