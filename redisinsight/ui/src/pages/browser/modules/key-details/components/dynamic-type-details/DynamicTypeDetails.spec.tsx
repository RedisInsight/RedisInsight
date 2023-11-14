import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import { KeyTypes, ModulesKeyTypes } from 'uiSrc/constants'
import { Props, DynamicTypeDetails } from './DynamicTypeDetails'

const mockedProps = mock<Props>()

const DynamicTypeDetailsTypeTests: any[] = [
  [KeyTypes.Hash, 'hash-details'],
  [KeyTypes.ZSet, 'zset-details'],
  [KeyTypes.Set, 'set-details'],
  [KeyTypes.List, 'list-details'],
  [KeyTypes.Stream, 'stream-details'],
  [KeyTypes.ReJSON, 'json-details'],
  [ModulesKeyTypes.Graph, 'modules-type-details'],
  [ModulesKeyTypes.TimeSeries, 'modules-type-details'],
  ['123', 'unsupported-type-details'],
]

describe('DynamicTypeDetails', () => {
  it('should render', () => {
    expect(render(<DynamicTypeDetails {...instance(mockedProps)} />)).toBeTruthy()
  })

  it.each(DynamicTypeDetailsTypeTests)('for key type: %s (reply), data-subj should exists: %s',
    (type: KeyTypes, testId: string) => {
      const { queryByTestId } = render(<DynamicTypeDetails
        {...instance(mockedProps)}
        selectedKeyType={type}
      />)
      expect(queryByTestId(testId)).toBeInTheDocument()
    })
})
