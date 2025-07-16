import { faker } from '@faker-js/faker'

import { BrowserPage } from '../../pageObjects/browser-page'
import { test, expect } from '../../fixtures/test'
import { ossStandaloneConfig } from '../../helpers/conf'
import {
    addStandaloneInstanceAndNavigateToIt,
    navigateToStandaloneInstance,
} from '../../helpers/utils'

test.describe('Browser - Delete Key', () => {
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
        // Clean up: delete the key if it still exists
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

    test.describe('when clicking on the delete button in the details view', () => {
        test('should delete string key successfully', async ({
            api: { keyService },
        }) => {
            // Arrange: Create a string key
            const keyValue = faker.lorem.words(3)
            await keyService.addStringKeyApi(
                { keyName, value: keyValue },
                ossStandaloneConfig,
            )

            // Verify key exists
            await browserPage.searchByKeyName(keyName)
            const keyExists =
                await browserPage.isKeyIsDisplayedInTheList(keyName)
            expect(keyExists).toBe(true)

            // Open key details and delete
            await browserPage.openKeyDetailsByKeyName(keyName)
            await browserPage.deleteKeyButton.click()
            await browserPage.confirmDeleteKeyButton.click()

            // Verify key is deleted
            await browserPage.searchByKeyName(keyName)
            const keyStillExists =
                await browserPage.isKeyIsDisplayedInTheList(keyName)
            expect(keyStillExists).toBe(false)
        })

        test('should delete hash key successfully', async ({
            api: { keyService },
        }) => {
            // Arrange: Create a hash key
            const fieldName = faker.string.alphanumeric(8)
            const fieldValue = faker.lorem.words(2)
            await keyService.addHashKeyApi(
                {
                    keyName,
                    fields: [{ field: fieldName, value: fieldValue }],
                },
                ossStandaloneConfig,
            )

            // Verify key exists
            await browserPage.searchByKeyName(keyName)
            const keyExists =
                await browserPage.isKeyIsDisplayedInTheList(keyName)
            expect(keyExists).toBe(true)

            // Open key details and delete
            await browserPage.openKeyDetailsByKeyName(keyName)
            await browserPage.deleteKeyButton.click()
            await browserPage.confirmDeleteKeyButton.click()

            // Verify key is deleted
            await browserPage.searchByKeyName(keyName)
            const keyStillExists =
                await browserPage.isKeyIsDisplayedInTheList(keyName)
            expect(keyStillExists).toBe(false)
        })

        test('should delete list key successfully', async ({
            api: { keyService },
        }) => {
            // Arrange: Create a list key
            const listElements = [
                faker.lorem.word(),
                faker.lorem.word(),
                faker.lorem.word(),
            ]
            await keyService.addListKeyApi(
                { keyName, elements: listElements },
                ossStandaloneConfig,
            )

            // Verify key exists
            await browserPage.searchByKeyName(keyName)
            const keyExists =
                await browserPage.isKeyIsDisplayedInTheList(keyName)
            expect(keyExists).toBe(true)

            // Open key details and delete
            await browserPage.openKeyDetailsByKeyName(keyName)
            await browserPage.deleteKeyButton.click()
            await browserPage.confirmDeleteKeyButton.click()

            // Verify key is deleted
            await browserPage.searchByKeyName(keyName)
            const keyStillExists =
                await browserPage.isKeyIsDisplayedInTheList(keyName)
            expect(keyStillExists).toBe(false)
        })

        test('should delete set key successfully', async ({
            api: { keyService },
        }) => {
            // Arrange: Create a set key
            const setMembers = [
                faker.lorem.word(),
                faker.lorem.word(),
                faker.lorem.word(),
            ]
            await keyService.addSetKeyApi(
                { keyName, members: setMembers },
                ossStandaloneConfig,
            )

            // Verify key exists
            await browserPage.searchByKeyName(keyName)
            const keyExists =
                await browserPage.isKeyIsDisplayedInTheList(keyName)
            expect(keyExists).toBe(true)

            // Open key details and delete
            await browserPage.openKeyDetailsByKeyName(keyName)
            await browserPage.deleteKeyButton.click()
            await browserPage.confirmDeleteKeyButton.click()

            // Verify key is deleted
            await browserPage.searchByKeyName(keyName)
            const keyStillExists =
                await browserPage.isKeyIsDisplayedInTheList(keyName)
            expect(keyStillExists).toBe(false)
        })

        test('should delete sorted set key successfully', async ({
            api: { keyService },
        }) => {
            // Arrange: Create a zset key
            const zsetMembers = [
                { name: faker.lorem.word(), score: 1.5 },
                { name: faker.lorem.word(), score: 2.0 },
                { name: faker.lorem.word(), score: 10 },
            ]
            await keyService.addZSetKeyApi(
                { keyName, members: zsetMembers },
                ossStandaloneConfig,
            )

            // Verify key exists
            await browserPage.searchByKeyName(keyName)
            const keyExists =
                await browserPage.isKeyIsDisplayedInTheList(keyName)
            expect(keyExists).toBe(true)

            // Open key details and delete
            await browserPage.openKeyDetailsByKeyName(keyName)
            await browserPage.deleteKeyButton.click()
            await browserPage.confirmDeleteKeyButton.click()

            // Verify key is deleted
            await browserPage.searchByKeyName(keyName)
            const keyStillExists =
                await browserPage.isKeyIsDisplayedInTheList(keyName)
            expect(keyStillExists).toBe(false)
        })

        test('should delete json key successfully', async ({
            api: { keyService },
        }) => {
            // Arrange: Create a JSON key
            const jsonValue = {
                name: faker.person.fullName(),
                age: faker.number.int({ min: 18, max: 80 }),
                active: true,
            }
            await keyService.addJsonKeyApi(
                { keyName, value: jsonValue },
                ossStandaloneConfig,
            )

            // Verify key exists
            await browserPage.searchByKeyName(keyName)
            const keyExists =
                await browserPage.isKeyIsDisplayedInTheList(keyName)
            expect(keyExists).toBe(true)

            // Open key details and delete
            await browserPage.openKeyDetailsByKeyName(keyName)
            await browserPage.deleteKeyButton.click()
            await browserPage.confirmDeleteKeyButton.click()

            // Verify key is deleted
            await browserPage.searchByKeyName(keyName)
            const keyStillExists =
                await browserPage.isKeyIsDisplayedInTheList(keyName)
            expect(keyStillExists).toBe(false)
        })

        test('should delete stream key successfully', async ({
            api: { keyService },
        }) => {
            // Arrange: Create a stream key
            const streamEntries = [
                {
                    id: '*',
                    fields: [
                        { name: 'temperature', value: '25.5' },
                        { name: 'location', value: 'sensor-001' },
                    ],
                },
            ]
            await keyService.addStreamKeyApi(
                { keyName, entries: streamEntries },
                ossStandaloneConfig,
            )

            // Verify key exists
            await browserPage.searchByKeyName(keyName)
            const keyExists =
                await browserPage.isKeyIsDisplayedInTheList(keyName)
            expect(keyExists).toBe(true)

            // Open key details and delete
            await browserPage.openKeyDetailsByKeyName(keyName)
            await browserPage.deleteKeyButton.click()
            await browserPage.confirmDeleteKeyButton.click()

            // Verify key is deleted
            await browserPage.searchByKeyName(keyName)
            const keyStillExists =
                await browserPage.isKeyIsDisplayedInTheList(keyName)
            expect(keyStillExists).toBe(false)
        })
    })

    test('should delete key from list view using delete button', async ({
        api: { keyService },
    }) => {
        // Arrange: Create a string key for this test
        const keyValue = faker.lorem.words(2)
        await keyService.addStringKeyApi(
            { keyName, value: keyValue },
            ossStandaloneConfig,
        )

        // Verify key exists
        await browserPage.searchByKeyName(keyName)
        const keyExists = await browserPage.isKeyIsDisplayedInTheList(keyName)
        expect(keyExists).toBe(true)

        // Delete from list view (hover and click delete button)
        await browserPage.deleteKeyByNameFromList(keyName)

        // Verify key is deleted
        await browserPage.searchByKeyName(keyName)
        const keyStillExists =
            await browserPage.isKeyIsDisplayedInTheList(keyName)
        expect(keyStillExists).toBe(false)
    })

    test('should cancel key deletion when outside of the deletion confirmation popover', async ({
        api: { keyService },
    }) => {
        // Arrange: Create a string key
        const keyValue = faker.lorem.words(3)
        await keyService.addStringKeyApi(
            { keyName, value: keyValue },
            ossStandaloneConfig,
        )

        // Verify key exists
        await browserPage.searchByKeyName(keyName)
        const keyExists = await browserPage.isKeyIsDisplayedInTheList(keyName)
        expect(keyExists).toBe(true)

        // Open key details and start delete process but cancel
        await browserPage.openKeyDetailsByKeyName(keyName)
        await browserPage.deleteKeyButton.click()

        // Click outside the confirmation popover to cancel deletion (but close to it)
        await browserPage.keyDetailsHeader.click()

        // Verify key still exists
        await browserPage.searchByKeyName(keyName)
        const keyStillExists =
            await browserPage.isKeyIsDisplayedInTheList(keyName)
        expect(keyStillExists).toBe(true)
    })
})
