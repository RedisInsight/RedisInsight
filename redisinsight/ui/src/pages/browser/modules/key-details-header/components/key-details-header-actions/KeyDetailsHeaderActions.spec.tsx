import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import { KeyTypes } from 'uiSrc/constants'
import { Props, KeyDetailsHeaderActions } from './KeyDetailsHeaderActions'

const mockedProps = mock<Props>()

const actionsExistsTests: any[] = [
  [KeyTypes.Hash, ['add-key-value-items-btn']],
  [KeyTypes.List, ['add-key-value-items-btn', 'remove-key-value-items-btn']],
  [KeyTypes.Set, ['add-key-value-items-btn']],
  [KeyTypes.ZSet, ['add-key-value-items-btn']],
  [KeyTypes.String, ['edit-key-value-btn']],
]

describe('KeyDetailsHeaderActions', () => {
  it('should render', () => {
    expect(render(<KeyDetailsHeaderActions {...instance(mockedProps)} />)).toBeTruthy()
  })

  test.each(actionsExistsTests)('for keyType: %s, actions test id should exist: %s', (keyType: KeyTypes, testIds: string[]) => {
    const { queryByTestId } = render(<KeyDetailsHeaderActions
      {...instance(mockedProps)}
      keyType={keyType}
    />)

    testIds.forEach((testId) => {
      expect(queryByTestId(testId)).toBeInTheDocument()
    })
  })
})
