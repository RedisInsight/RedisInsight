import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import MonacoYaml from './MonacoYaml'

const monacoTestId = 'monaco-yaml'

describe('MonacoYaml', () => {
  it('should render', () => {
    const { queryByTestId } = render(<MonacoYaml
      schema={{}}
      value="val"
      onChange={jest.fn()}
      data-testid={monacoTestId}
    />)
    expect(queryByTestId(monacoTestId)).toBeInTheDocument()
  })
  it('should not render if schema is null', () => {
    const { queryByTestId } = render(<MonacoYaml
      schema={null}
      value="val"
      onChange={jest.fn()}
      data-testid={monacoTestId}
    />)
    expect(queryByTestId(monacoTestId)).not.toBeInTheDocument()
  })
})
