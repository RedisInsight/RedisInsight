import { getFunctionsLengthByType, getLibraryName } from 'uiSrc/utils/triggered-functions'
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

const getLibraryNamesTests: any[] = [
  [`#!js api_version=1.0 name=lib
    redis.registerStreamTrigger(
       'consumer', 'stream', async function(c, data)
      { redis.log(JSON.stringify(data, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value ));
 }`, 'lib'],
  ['!js api_version=1.0 name=lib1', 'lib1'],
  ['!js name=lib1 api_version=1.0', 'lib1'],
  [1, 'Library'],
  ['   ', 'Library'],
  [null, 'Library'],
  ['#!js api_version=1.0', 'Library'],
  ['#!js api_version=1.0 name = name', 'Library'],
]

describe('getLibraryName', () => {
  it.each(getLibraryNamesTests)('for input: %s (reply), should be output: %s',
    (reply, expected) => {
      const result = getLibraryName(reply)
      expect(result).toBe(expected)
    })
})
