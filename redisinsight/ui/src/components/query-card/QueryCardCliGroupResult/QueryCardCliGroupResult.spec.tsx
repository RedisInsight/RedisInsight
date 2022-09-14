import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import QueryCardCliGroupResult from './QueryCardCliGroupResult'

describe('QueryCardCliGroupResult', () => {
  it('should render', () => {
    const mockResult = [{
      response: [{
        response: 'response',
        status: 'success'
      }],
      status: 'success'
    }]
    expect(render(<QueryCardCliGroupResult result={mockResult} />)).toBeTruthy()
  })

  it('Should render result when result is undefined', () => {
    const mockResult = undefined

    expect(render(<QueryCardCliGroupResult result={mockResult} />)).toBeTruthy()
  })
})
