import { faker } from '@faker-js/faker'

import { BrowserPage } from '../../pageObjects/browser-page'
import { test, expect } from '../../fixtures/test'
import { ossStandaloneConfig } from '../../helpers/conf'
import {
    addStandaloneInstanceAndNavigateToIt,
    navigateToStandaloneInstance,
} from '../../helpers/utils'

test.describe('Browser - Edit Key Operations', () => {
    let browserPage: BrowserPage
    let keyName: string
    let cleanupInstance: () => Promise<void>

    test.beforeEach(async ({ page, api: { databaseService } }) => {
        browserPage = new BrowserPage(page)
        keyName = faker.string.alphanumeric(10)
        cleanupInstance = await addStandaloneInstanceAndNavigateToIt(
            page,
            databaseService,
        )

        await navigateToStandaloneInstance(page)
    })

    test.afterEach(async ({ api: { keyService } }) => {
        // Clean up: delete the key if it exists
        try {
            await keyService.deleteKeyByNameApi(
                keyName,
                ossStandaloneConfig.databaseName,
            )
        } catch (error) {
            // Key might already be deleted in test, ignore error
        }

        await cleanupInstance()
    })

    test.describe('Key Name Editing', () => {
        test('should edit string key name successfully', async ({
            api: { keyService },
        }) => {
            // Arrange: Create a string key
            const keyValue = faker.lorem.words(3)
            const newKeyName = `${keyName}_renamed`

            await keyService.addStringKeyApi(
                { keyName, value: keyValue },
                ossStandaloneConfig,
            )

            // Open key details
            await browserPage.searchByKeyName(keyName)
            await browserPage.openKeyDetailsByKeyName(keyName)

            // Edit key name
            await browserPage.editKeyNameButton.click()
            await browserPage.keyNameInput.clear()
            await browserPage.keyNameInput.fill(newKeyName)
            await browserPage.applyButton.click()

            // Verify key name was updated in the details header
            await expect
                .poll(async () => {
                    const keyNameText =
                        await browserPage.keyNameFormDetails.textContent()
                    return keyNameText
                })
                .toContain(newKeyName)

            // Wait for the key list to update and verify the new key exists
            await expect
                .poll(async () => {
                    await browserPage.searchByKeyName(newKeyName)
                    return browserPage.isKeyIsDisplayedInTheList(newKeyName)
                })
                .toBe(true)

            // Verify the old key name doesn't exist in list
            await expect
                .poll(async () => {
                    await browserPage.searchByKeyName(keyName)
                    return browserPage.isKeyIsDisplayedInTheList(keyName)
                })
                .toBe(false)

            // Update keyName for cleanup
            keyName = newKeyName
        })

        test('should cancel key name edit operation', async ({
            api: { keyService },
        }) => {
            // Arrange: Create a string key
            const keyValue = faker.lorem.words(3)
            const originalKeyName = keyName
            const attemptedNewName = `${keyName}_attempted_rename`

            await keyService.addStringKeyApi(
                { keyName, value: keyValue },
                ossStandaloneConfig,
            )

            // Open key details
            await browserPage.searchByKeyName(keyName)
            await browserPage.openKeyDetailsByKeyName(keyName)

            // Verify original key name is displayed
            const displayedOriginalName =
                await browserPage.keyNameFormDetails.textContent()
            expect(displayedOriginalName).toContain(originalKeyName)

            // Start editing but cancel
            await browserPage.editKeyNameButton.click()
            await browserPage.keyNameInput.clear()
            await browserPage.keyNameInput.fill(attemptedNewName)

            // Cancel the edit by clicking outside the edit area
            await browserPage.keyDetailsHeader.click()

            // Verify the original key name is still displayed (edit was cancelled)
            const displayedNameAfterCancel =
                await browserPage.keyNameFormDetails.textContent()
            expect(displayedNameAfterCancel).toContain(originalKeyName)
            expect(displayedNameAfterCancel).not.toContain(attemptedNewName)

            // Verify the original key still exists in the list
            await browserPage.searchByKeyName(originalKeyName)
            const originalKeyExists =
                await browserPage.isKeyIsDisplayedInTheList(originalKeyName)
            expect(originalKeyExists).toBe(true)

            // Verify the attempted new name doesn't exist
            await browserPage.searchByKeyName(attemptedNewName)
            const attemptedKeyExists =
                await browserPage.isKeyIsDisplayedInTheList(attemptedNewName)
            expect(attemptedKeyExists).toBe(false)
        })
    })

    test.describe('String Key Editing', () => {
        test('should edit string key value successfully', async ({
            api: { keyService },
        }) => {
            // Arrange: Create a string key
            const originalValue = faker.lorem.words(3)
            const newValue = faker.lorem.words(4)

            await keyService.addStringKeyApi(
                { keyName, value: originalValue },
                ossStandaloneConfig,
            )

            // Open key details
            await browserPage.searchByKeyName(keyName)
            await browserPage.openKeyDetailsByKeyName(keyName)

            // Verify original value is displayed
            const displayedOriginalValue = await browserPage.getStringKeyValue()
            expect(displayedOriginalValue).toContain(originalValue)

            // Edit the key value
            await browserPage.editKeyValueButton.click()
            await browserPage.stringKeyValueInput.clear()
            await browserPage.stringKeyValueInput.fill(newValue)
            await browserPage.applyButton.click()

            // Wait for key value to update
            await expect
                .poll(async () => {
                    const currentValue = await browserPage.getStringKeyValue()
                    return currentValue
                })
                .toContain(newValue)

            // Wait for key length to update
            await expect
                .poll(async () => {
                    const keyLength = await browserPage.getKeyLength()
                    return keyLength
                })
                .toBe(newValue.length.toString())
        })

        test('should cancel string key value edit operation', async ({
            api: { keyService },
        }) => {
            // Arrange: Create a string key
            const originalValue = faker.lorem.words(3)
            const attemptedNewValue = faker.lorem.words(4)

            await keyService.addStringKeyApi(
                { keyName, value: originalValue },
                ossStandaloneConfig,
            )

            // Open key details
            await browserPage.searchByKeyName(keyName)
            await browserPage.openKeyDetailsByKeyName(keyName)

            // Verify original value is displayed
            const displayedOriginalValue = await browserPage.getStringKeyValue()
            expect(displayedOriginalValue).toContain(originalValue)

            // Start editing but cancel
            await browserPage.editKeyValueButton.click()
            await browserPage.stringKeyValueInput.clear()
            await browserPage.stringKeyValueInput.fill(attemptedNewValue)

            // Cancel the edit by clicking outside or using cancel action
            await browserPage.keyDetailsHeader.click()

            // Verify the original value is still displayed (edit was cancelled)
            const displayedValueAfterCancel =
                await browserPage.getStringKeyValue()
            expect(displayedValueAfterCancel).toContain(originalValue)
            expect(displayedValueAfterCancel).not.toContain(attemptedNewValue)
        })
    })
})
