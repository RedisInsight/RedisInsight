import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { FILTER_GROUP_TYPE_OPTIONS } from './constants'
import CliSearchFilter from './CliSearchFilter'

describe('CliSearchFilter', () => {
  it('should render', () => {
    expect(render(<CliSearchFilter submitFilter={jest.fn()} />)).toBeTruthy()
  })

  it('should call submitFilter after choose options', () => {
    const submitFilter = jest.fn()
    const { queryByText } = render(<CliSearchFilter submitFilter={submitFilter} />)
    fireEvent.click(screen.getByTestId('select-filter-group-type'))
    fireEvent.click(queryByText(FILTER_GROUP_TYPE_OPTIONS[0].text) || document)

    expect(submitFilter).toBeCalledWith(FILTER_GROUP_TYPE_OPTIONS[0].value)
  })
})
