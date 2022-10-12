import { CodeButtonParams } from 'uiSrc/pages/workbench/components/enablement-area/interfaces'
import { ExecuteQueryParams, ResultsMode, RunQueryMode } from 'uiSrc/slices/interfaces'
import { getExecuteParams } from 'uiSrc/utils'

const paramsState: ExecuteQueryParams = {
  activeRunQueryMode: RunQueryMode.ASCII,
  resultsMode: ResultsMode.GroupMode,
  batchSize: 10
}

describe('getExecuteParams', () => {
  it('should properly return params', () => {
    const btnParams1: CodeButtonParams = { pipeline: '5', mode: 'raw' }
    const btnParams2: CodeButtonParams = { pipeline: '1.5', mode: 'ascii' }
    const btnParams3: CodeButtonParams = { pipeline: 'abc' }
    const btnParams4: CodeButtonParams = { results: 'single', mode: 'raw' }
    const btnParams5: CodeButtonParams = { results: 'single', mode: 'raw', pipeline: '4' }

    const expect1 = { activeRunQueryMode: RunQueryMode.Raw, resultsMode: ResultsMode.GroupMode, batchSize: 5 }
    const expect2 = { activeRunQueryMode: RunQueryMode.ASCII, resultsMode: ResultsMode.GroupMode, batchSize: 10 }
    const expect3 = { activeRunQueryMode: RunQueryMode.ASCII, resultsMode: ResultsMode.GroupMode, batchSize: 10 }
    const expect4 = { activeRunQueryMode: RunQueryMode.Raw, resultsMode: ResultsMode.Default, batchSize: 10 }
    const expect5 = { activeRunQueryMode: RunQueryMode.Raw, resultsMode: ResultsMode.Default, batchSize: 4 }

    expect(getExecuteParams(btnParams1, paramsState)).toEqual(expect1)
    expect(getExecuteParams(btnParams2, paramsState)).toEqual(expect2)
    expect(getExecuteParams(btnParams3, paramsState)).toEqual(expect3)
    expect(getExecuteParams(btnParams4, paramsState)).toEqual(expect4)
    expect(getExecuteParams(btnParams5, paramsState)).toEqual(expect5)
  })
})
