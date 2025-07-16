import { faker } from '@faker-js/faker'

import { BrowserPage } from '../../pageObjects/browser-page'
import { test, expect } from '../../fixtures/test'
import { ossStandaloneConfig } from '../../helpers/conf'
import { AddElementInList } from '../../helpers/constants'
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

            // Open key details and verify original value
            await browserPage.searchByKeyName(keyName)
            await browserPage.openKeyDetailsByKeyName(keyName)

            const displayedOriginalValue = await browserPage.getStringKeyValue()
            expect(displayedOriginalValue).toContain(originalValue)

            // Edit the key value
            await browserPage.editStringKeyValue(newValue)

            // Wait for value and length to update
            await browserPage.waitForStringValueToUpdate(newValue)
            await browserPage.waitForKeyLengthToUpdate(
                newValue.length.toString(),
            )
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

            // Open key details and verify original value
            await browserPage.searchByKeyName(keyName)
            await browserPage.openKeyDetailsByKeyName(keyName)

            const displayedOriginalValue = await browserPage.getStringKeyValue()
            expect(displayedOriginalValue).toContain(originalValue)

            // Start editing but cancel
            await browserPage.cancelStringKeyValueEdit(attemptedNewValue)

            // Verify the original value is still displayed
            const displayedValueAfterCancel =
                await browserPage.getStringKeyValue()
            expect(displayedValueAfterCancel).toContain(originalValue)
            expect(displayedValueAfterCancel).not.toContain(attemptedNewValue)
        })
    })

    test.describe('Hash Key Editing', () => {
        test('should edit hash field value successfully', async ({
            api: { keyService },
        }) => {
            // Arrange: Create a hash key with a field
            const fieldName = faker.string.alphanumeric(8)
            const originalValue = faker.lorem.words(3)
            const newValue = faker.lorem.words(4)

            await keyService.addHashKeyApi(
                {
                    keyName,
                    fields: [{ field: fieldName, value: originalValue }],
                },
                ossStandaloneConfig,
            )

            // Open key details and wait for hash to load
            await browserPage.searchByKeyName(keyName)
            await browserPage.openKeyDetailsByKeyName(keyName)

            // Wait for field to be visible and verify original value
            await browserPage.waitForHashFieldToBeVisible(fieldName)
            await browserPage.verifyHashFieldValue(fieldName, originalValue)

            // Edit the hash field value
            await browserPage.editHashFieldValue(fieldName, newValue)

            // Verify the value was updated
            await browserPage.verifyHashFieldValue(fieldName, newValue)
        })

        test('should cancel hash field value edit operation', async ({
            api: { keyService },
        }) => {
            // Arrange: Create a hash key with a field
            const fieldName = faker.string.alphanumeric(8)
            const originalValue = faker.lorem.words(3)
            const attemptedNewValue = faker.lorem.words(4)

            await keyService.addHashKeyApi(
                {
                    keyName,
                    fields: [{ field: fieldName, value: originalValue }],
                },
                ossStandaloneConfig,
            )

            // Open key details and wait for hash to load
            await browserPage.searchByKeyName(keyName)
            await browserPage.openKeyDetailsByKeyName(keyName)
            await browserPage.waitForHashDetailsToBeVisible()
            await browserPage.verifyHashFieldValue(fieldName, originalValue)

            // Start editing but cancel
            await browserPage.cancelHashFieldEdit(fieldName, attemptedNewValue)

            // Verify the original value is still present and attempted value is not
            await browserPage.verifyHashFieldValueContains(
                fieldName,
                originalValue,
            )
            await browserPage.verifyHashFieldValueNotContains(
                fieldName,
                attemptedNewValue,
            )
        })

        test('should add new field to hash key successfully', async ({
            api: { keyService },
        }) => {
            // Arrange: Create a hash key with one field
            const existingFieldName = faker.string.alphanumeric(8)
            const existingFieldValue = faker.lorem.words(2)
            const newFieldName = faker.string.alphanumeric(8)
            const newFieldValue = faker.lorem.words(3)

            await keyService.addHashKeyApi(
                {
                    keyName,
                    fields: [
                        { field: existingFieldName, value: existingFieldValue },
                    ],
                },
                ossStandaloneConfig,
            )

            // Open key details and verify initial state
            await browserPage.searchByKeyName(keyName)
            await browserPage.openKeyDetailsByKeyName(keyName)
            await browserPage.waitForHashDetailsToBeVisible()
            await browserPage.waitForKeyLengthToUpdate('1')

            // Add a new field
            await browserPage.addFieldToHash(newFieldName, newFieldValue)

            // Verify new field appears and length updates
            await browserPage.waitForHashFieldToBeVisible(newFieldName)
            await browserPage.verifyHashFieldValue(newFieldName, newFieldValue)
            await browserPage.waitForKeyLengthToUpdate('2')

            // Verify existing field still exists
            await browserPage.verifyHashFieldValue(
                existingFieldName,
                existingFieldValue,
            )
        })

        test('should remove hash field successfully', async ({
            api: { keyService },
        }) => {
            // Arrange: Create a hash key with multiple fields
            const field1Name = faker.string.alphanumeric(8)
            const field1Value = faker.lorem.words(2)
            const field2Name = faker.string.alphanumeric(8)
            const field2Value = faker.lorem.words(2)

            await keyService.addHashKeyApi(
                {
                    keyName,
                    fields: [
                        { field: field1Name, value: field1Value },
                        { field: field2Name, value: field2Value },
                    ],
                },
                ossStandaloneConfig,
            )

            // Open key details and verify initial state
            await browserPage.searchByKeyName(keyName)
            await browserPage.openKeyDetailsByKeyName(keyName)
            await browserPage.waitForHashDetailsToBeVisible()
            await browserPage.waitForKeyLengthToUpdate('2')

            // Remove the first field
            await browserPage.removeHashField(field1Name)

            // Verify field was removed and length updated
            await browserPage.waitForKeyLengthToUpdate('1')
            await browserPage.verifyHashFieldNotVisible(field1Name)

            // Verify other field still exists and key is still open
            await browserPage.verifyHashFieldValue(field2Name, field2Value)
            const keyStillExists = await browserPage.isKeyDetailsOpen(keyName)
            expect(keyStillExists).toBe(true)
        })
    })

    test.describe('TTL Editing', () => {
        test('should edit string key TTL successfully', async ({
            api: { keyService },
        }) => {
            // Arrange: Create a string key with TTL
            const keyValue = faker.lorem.words(3)
            const initialTTL = 3600 // 1 hour
            const newTTL = 7200 // 2 hours

            await keyService.addStringKeyApi(
                { keyName, value: keyValue, expire: initialTTL },
                ossStandaloneConfig,
            )

            // Open key details and verify initial TTL
            await browserPage.openKeyDetailsAndVerify(keyName)
            await browserPage.verifyTTLIsNotPersistent()

            // Edit the TTL and verify update
            await browserPage.editKeyTTLValue(newTTL)
            await browserPage.waitForTTLToUpdate(initialTTL)
            await browserPage.verifyTTLIsWithinRange(newTTL)
        })

        test('should remove TTL from string key (set to persistent)', async ({
            api: { keyService },
        }) => {
            // Arrange: Create a string key with TTL
            const keyValue = faker.lorem.words(3)
            const initialTTL = 3600 // 1 hour

            await keyService.addStringKeyApi(
                { keyName, value: keyValue, expire: initialTTL },
                ossStandaloneConfig,
            )

            // Open key details and verify initial TTL
            await browserPage.openKeyDetailsAndVerify(keyName)
            await browserPage.verifyTTLIsNotPersistent()

            // Remove TTL and verify it becomes persistent
            await browserPage.removeKeyTTL()
            await browserPage.verifyTTLIsPersistent()
        })
    })

    test.describe('List Key Editing', () => {
        test('should edit list element value successfully', async ({
            api: { keyService },
        }) => {
            // Arrange: Create a list key with multiple elements
            const listElements = [
                faker.lorem.word(),
                faker.lorem.word(),
                faker.lorem.word(),
            ]
            const newElementValue = faker.lorem.word()

            await keyService.addListKeyApi(
                { keyName, elements: listElements },
                ossStandaloneConfig,
            )

            // Open key details and verify initial content
            await browserPage.openKeyDetailsAndVerify(keyName)
            await browserPage.verifyListContainsElements(listElements)
            await browserPage.verifyKeyLength(listElements.length.toString())

            // Edit the first element value
            await browserPage.editListElementValue(newElementValue)

            // Verify the element was updated
            await browserPage.verifyListContainsElements([newElementValue])
            await browserPage.verifyListDoesNotContainElements([
                listElements[0],
            ])
            await browserPage.verifyKeyLength(listElements.length.toString()) // Length should remain the same
        })

        test('should cancel list element edit successfully', async ({
            api: { keyService },
        }) => {
            // Arrange: Create a list key
            const listElements = [faker.lorem.word(), faker.lorem.word()]
            const attemptedValue = faker.lorem.word()

            await keyService.addListKeyApi(
                { keyName, elements: listElements },
                ossStandaloneConfig,
            )

            // Open key details and start edit but cancel
            await browserPage.openKeyDetailsAndVerify(keyName)
            await browserPage.verifyListContainsElements(listElements)

            // Start edit but cancel
            await browserPage.cancelListElementEdit(attemptedValue)

            // Verify original content is preserved
            await browserPage.verifyListContainsElements(listElements)
            await browserPage.verifyListDoesNotContainElements([attemptedValue])
        })

        test('should add elements to list tail successfully', async ({
            api: { keyService },
        }) => {
            // Arrange: Create a list key with initial elements
            const initialElements = [faker.lorem.word(), faker.lorem.word()]
            const newElements = [faker.lorem.word(), faker.lorem.word()]

            await keyService.addListKeyApi(
                { keyName, elements: initialElements },
                ossStandaloneConfig,
            )

            // Open key details and add elements to tail
            await browserPage.openKeyDetailsAndVerify(keyName)
            await browserPage.verifyListContainsElements(initialElements)

            await browserPage.addElementsToList(
                newElements,
                AddElementInList.Tail,
            )

            // Verify all elements are present and length is updated
            const expectedLength = initialElements.length + newElements.length
            await browserPage.waitForListLengthToUpdate(expectedLength)
            await browserPage.verifyListContainsElements([
                ...initialElements,
                ...newElements,
            ])
        })

        test('should add elements to list head successfully', async ({
            api: { keyService },
        }) => {
            // Arrange: Create a list key with initial elements
            const initialElements = [faker.lorem.word(), faker.lorem.word()]
            const newElements = [faker.lorem.word()]

            await keyService.addListKeyApi(
                { keyName, elements: initialElements },
                ossStandaloneConfig,
            )

            // Open key details and add elements to head
            await browserPage.openKeyDetailsAndVerify(keyName)
            await browserPage.verifyListContainsElements(initialElements)

            await browserPage.addElementsToList(
                newElements,
                AddElementInList.Head,
            )

            // Verify all elements are present and length is updated
            const expectedLength = initialElements.length + newElements.length
            await browserPage.waitForListLengthToUpdate(expectedLength)
            await browserPage.verifyListContainsElements([
                ...newElements,
                ...initialElements,
            ])
        })

        test('should remove elements from list tail successfully', async ({
            api: { keyService },
        }) => {
            // Arrange: Create a list key with multiple elements
            const listElements = [
                faker.lorem.word(),
                faker.lorem.word(),
                faker.lorem.word(),
                faker.lorem.word(),
            ]
            const removeCount = 2

            await keyService.addListKeyApi(
                { keyName, elements: listElements },
                ossStandaloneConfig,
            )

            // Open key details and remove elements from tail
            await browserPage.openKeyDetailsAndVerify(keyName)
            await browserPage.verifyListContainsElements(listElements)

            await browserPage.removeListElementsFromTail(removeCount)

            // Verify length is updated (Redis lists remove from the right/tail)
            const expectedLength = listElements.length - removeCount
            await browserPage.waitForListLengthToUpdate(expectedLength)
            await browserPage.verifyKeyLength(expectedLength.toString())

            // Verify the correct elements were removed (last 2 elements should be gone)
            const remainingElements = listElements.slice(0, -removeCount) // Keep all but last 2
            const removedElements = listElements.slice(-removeCount) // Last 2 elements
            await browserPage.verifyListContainsElements(remainingElements)
            await browserPage.verifyListDoesNotContainElements(removedElements)
        })

        test('should remove elements from list head successfully', async ({
            api: { keyService },
        }) => {
            // Arrange: Create a list key with multiple elements
            const listElements = [
                faker.lorem.word(),
                faker.lorem.word(),
                faker.lorem.word(),
                faker.lorem.word(),
            ]
            const removeCount = 1

            await keyService.addListKeyApi(
                { keyName, elements: listElements },
                ossStandaloneConfig,
            )

            // Open key details and remove elements from head
            await browserPage.openKeyDetailsAndVerify(keyName)
            await browserPage.verifyListContainsElements(listElements)

            await browserPage.removeListElementsFromHead(removeCount)

            // Verify length is updated (Redis lists remove from the left/head)
            const expectedLength = listElements.length - removeCount
            await browserPage.waitForListLengthToUpdate(expectedLength)
            await browserPage.verifyKeyLength(expectedLength.toString())

            // Verify the correct elements were removed (first element should be gone)
            const remainingElements = listElements.slice(removeCount) // Skip first element
            const removedElements = listElements.slice(0, removeCount) // First element
            await browserPage.verifyListContainsElements(remainingElements)
            await browserPage.verifyListDoesNotContainElements(removedElements)
        })

        test('should handle removing all elements from list', async ({
            api: { keyService },
        }) => {
            // Arrange: Create a list key with a few elements
            const listElements = [faker.lorem.word(), faker.lorem.word()]

            await keyService.addListKeyApi(
                { keyName, elements: listElements },
                ossStandaloneConfig,
            )

            // Open key details and remove all elements
            await browserPage.openKeyDetailsAndVerify(keyName)
            await browserPage.verifyListContainsElements(listElements)

            await browserPage.removeListElementsFromTail(listElements.length)

            // Verify list is empty (key should be removed when list becomes empty)
            await expect
                .poll(async () => {
                    try {
                        return await browserPage.isKeyDetailsOpen(keyName)
                    } catch {
                        return false
                    }
                })
                .toBe(false)
        })
    })
})
