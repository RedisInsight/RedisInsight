import { test, expect } from '../fixtures/open-ri'

test.beforeEach(async ({ basePage , dialogUserAgreement}) => {
    await dialogUserAgreement.acceptLicenseTerms()
    await basePage.getText('sa')

})

test('basic test', async ({ basePage, page }) => {
    await basePage.click('button')
    await expect(page.getByTestId('todo-title')).toContainText(['something nice'])
})
