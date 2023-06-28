import { getFunctionsLengthByType } from 'uiSrc/utils/triggered-functions'
import { TRIGGERED_FUNCTIONS_FUNCTIONS_LIST_MOCKED_DATA } from 'uiSrc/mocks/data/triggeredFunctions'
import { FunctionType } from 'uiSrc/slices/interfaces/triggeredFunctions'

describe('getFunctionsLengthByType', () => {
  it('should properly return number of functions by type', () => {
    expect(getFunctionsLengthByType(TRIGGERED_FUNCTIONS_FUNCTIONS_LIST_MOCKED_DATA)).toEqual({
      cluster_functions: 1,
      functions: 2,
      keyspace_triggers: 1,
      stream_triggers: 1,
    })

    expect(getFunctionsLengthByType([{ name: '', type: FunctionType.ClusterFunction }])).toEqual({
      cluster_functions: 1,
      functions: 0,
      keyspace_triggers: 0,
      stream_triggers: 0,
    })

    expect(getFunctionsLengthByType([])).toEqual({
      cluster_functions: 0,
      functions: 0,
      keyspace_triggers: 0,
      stream_triggers: 0,
    })
  })
})
