import { test, expect } from '../fixtures/open-ri'

test.beforeEach(async ({ basePage , dialogUserAgreement}) => {
    // await dialogUserAgreement.acceptLicenseTerms()
    // await basePage.getText('sa')
    console.log("WE ARE IN THE BEFORE STEP")
})

test.afterEach(async ({ basePage , dialogUserAgreement}) => {
    // await dialogUserAgreement.acceptLicenseTerms()
    // await basePage.getText('sa')
    console.log('WE ARE IN THE AFTER STEP')
})

test('basic test', async ({ basePage, page }) => {
    // await basePage.click('button')
    // await expect(page.getByTestId('todo-title')).toContainText(['something nice'])
    console.log('WE ARE IN TEST')
})
