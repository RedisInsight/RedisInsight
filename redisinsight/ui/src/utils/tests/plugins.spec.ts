import { getVisualizationsByCommand } from 'uiSrc/utils'
import { IPluginVisualization } from 'uiSrc/slices/interfaces'

describe('getVisualizationsByCommand', () => {
  it('should return proper visualizations by query', () => {
    const visualizations = [
      { matchCommands: ['ft.search', 'ft.get'] },
      { matchCommands: ['ft._list'] },
      { matchCommands: ['ft.*'] },
      { matchCommands: ['get'] }
    ] as IPluginVisualization[]

    const query1 = 'ft.search sa'
    const query2 = 'ft.get zxc'
    const query3 = 'command ft. zxc zxcz ft'
    const query4 = 'command ft'
    const query5 = 'any command'
    const query6 = 'get key'

    expect(getVisualizationsByCommand(query1, visualizations)).toHaveLength(2)
    expect(getVisualizationsByCommand(query2, visualizations)).toHaveLength(2)
    expect(getVisualizationsByCommand(query3, visualizations)).toHaveLength(0)
    expect(getVisualizationsByCommand(query4, visualizations)).toHaveLength(0)
    expect(getVisualizationsByCommand(query5, visualizations)).toHaveLength(0)
    expect(getVisualizationsByCommand(query6, visualizations)).toHaveLength(1)
  })
})
