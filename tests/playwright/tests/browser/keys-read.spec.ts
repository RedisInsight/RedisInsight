import { faker } from '@faker-js/faker'

import { BrowserPage } from '../../pageObjects/browser-page'
import { test, expect } from '../../fixtures/test'
import { ossStandaloneConfig } from '../../helpers/conf'
import {
    addStandaloneInstanceAndNavigateToIt,
    navigateToStandaloneInstance,
} from '../../helpers/utils'

test.describe('Browser - Read Key Details', () => {
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

    test('should open key details when clicking on string key', async ({
        api: { keyService },
    }) => {
        // Arrange test data
        const keyValue = faker.lorem.words(3)
        const keyTTL = 3600 // 1 hour

        // Create a string key with TTL using API
        await keyService.addStringKeyApi(
            { keyName, value: keyValue, expire: keyTTL },
            ossStandaloneConfig,
        )

        // Search for the key to ensure it's visible
        await browserPage.searchByKeyName(keyName)

        // Click on the key to open details
        await browserPage.openKeyDetailsByKeyName(keyName)

        // Verify key details panel is open
        const isDetailsOpen = await browserPage.isKeyDetailsOpen(keyName)
        expect(isDetailsOpen).toBe(true)

        // Verify the key value is displayed
        const displayedValue = await browserPage.getStringKeyValue()
        expect(displayedValue).toContain(keyValue)

        // Verify the key length is displayed correctly
        const displayedLength = await browserPage.getKeyLength()
        expect(displayedLength).toBe(`${keyValue.length}`)

        // Verify the key size (bytes) is displayed correctly
        const keySizeText = await browserPage.keySizeDetails.textContent()
        expect(keySizeText).toBeTruthy()

        // Verify the TTL value is displayed correctly
        const displayedTTL = await browserPage.keyDetailsTTL.textContent()
        expect(displayedTTL).toContain('TTL:')

        // Extract the TTL value from the text and verify it's within expected range
        // TTL format is "TTL: {value}" where value could be the actual number or "No limit"
        const ttlMatch = displayedTTL?.match(/TTL:\s*(\d+|No limit)/)
        expect(ttlMatch).toBeTruthy()

        if (ttlMatch && ttlMatch[1] !== 'No limit') {
            const actualTTL = parseInt(ttlMatch[1], 10)
            // TTL should be close to what we set (allowing for some time passage during test execution)
            // Should be between our set value minus 60 seconds (1 minute buffer) and our set value
            expect(actualTTL).toBeGreaterThan(keyTTL - 60)
            expect(actualTTL).toBeLessThanOrEqual(keyTTL)
        }

        // Close the details
        await browserPage.closeKeyDetails()

        // Verify details are closed
        const isDetailsClosed = await browserPage.isKeyDetailsClosed()
        expect(isDetailsClosed).toBe(true)
    })
})
