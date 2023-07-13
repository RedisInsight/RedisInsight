import { localStorageService } from 'uiSrc/services'
import { optimizeLSInstances } from '../optimizations'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  setDBConfigStorageField: jest.fn(),
}))

describe('optimizeLSInstances', () => {
  it('should call localStorageService.getAll if optimization needed', () => {
    const instancesMock = [{ id: 'id' }]
    localStorageService.getAll = jest.fn().mockReturnValue({
      treeViewDelimiterid: ':',
      dbConfig_id: '',
    })

    optimizeLSInstances(instancesMock)
    expect(localStorageService.getAll).toBeCalled()
  })
})
