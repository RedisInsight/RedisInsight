import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'

import NameSpacesTable, { Props } from './NameSpacesTable'

const mockedProps = mock<Props>()

/**
 * NameSpacesTable tests
 *
 * @group unit
 */
describe('NameSpacesTable', () => {
  it('should render', () => {
    expect(render(<NameSpacesTable {...instance(mockedProps)} />)).toBeTruthy()
  })
})
