import React from 'react'
import { getLetterByIndex } from 'uiSrc/utils'
import { rgb } from 'uiSrc/utils/colors'
import { render, screen } from 'uiSrc/utils/test-utils'

import ClusterNodesTable from './ClusterNodesTable'
import { ModifiedClusterNodes } from '../../ClusterDetailsPage'

const mockNodes = [
  {
    id: '1',
    host: '0.0.0.1',
    port: 6379,
    role: 'primary',
    slots: ['10923-16383'],
    health: 'online',
    totalKeys: 1,
    usedMemory: 2867968,
    opsPerSecond: 1,
    connectionsReceived: 13,
    connectedClients: 6,
    commandsProcessed: 5678,
    networkInKbps: 0.02,
    networkOutKbps: 0,
    cacheHitRatio: 1,
    replicationOffset: 6924,
    uptimeSec: 5614,
    version: '6.2.6',
    mode: 'cluster',
    replicas: [],
  },
  {
    id: '2',
    host: '0.0.0.2',
    port: 6379,
    role: 'primary',
    slots: ['0-5460'],
    health: 'online',
    totalKeys: 4,
    usedMemory: 2825880,
    opsPerSecond: 1,
    connectionsReceived: 15,
    connectedClients: 4,
    commandsProcessed: 5667,
    networkInKbps: 0.04,
    networkOutKbps: 0,
    cacheHitRatio: 1,
    replicationOffset: 6910,
    uptimeSec: 5609,
    version: '6.2.6',
    mode: 'cluster',
    replicas: [],
  },
  {
    id: '3',
    host: '0.0.0.3',
    port: 6379,
    role: 'primary',
    slots: ['5461-10922'],
    health: 'online',
    totalKeys: 10,
    usedMemory: 2886960,
    opsPerSecond: 0,
    connectionsReceived: 18,
    connectedClients: 7,
    commandsProcessed: 5697,
    networkInKbps: 0.02,
    networkOutKbps: 0,
    cacheHitRatio: 0,
    replicationOffset: 6991,
    uptimeSec: 5609,
    version: '6.2.6',
    mode: 'cluster',
    replicas: [],
  },
].map((d, index) => ({
  ...d,
  letter: getLetterByIndex(index),
  index,
  color: [0, 0, 0],
})) as ModifiedClusterNodes[]

describe('ClusterNodesTable', () => {
  it('should render', () => {
    expect(
      render(<ClusterNodesTable nodes={mockNodes} loading={false} />),
    ).toBeTruthy()
  })

  it('should render loading content', () => {
    render(<ClusterNodesTable nodes={null} loading />)
    expect(
      screen.getByTestId('primary-nodes-table-loading'),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('primary-nodes-table')).not.toBeInTheDocument()
  })

  it('should render table', () => {
    render(<ClusterNodesTable nodes={mockNodes} loading={false} />)
    expect(screen.getByTestId('primary-nodes-table')).toBeInTheDocument()
    expect(
      screen.queryByTestId('primary-nodes-table-loading'),
    ).not.toBeInTheDocument()
  })

  it('should render table with 3 items', () => {
    render(<ClusterNodesTable nodes={mockNodes} loading={false} />)
    expect(screen.getAllByTestId('node-letter')).toHaveLength(3)
  })

  it('should highlight max value for total keys', () => {
    render(<ClusterNodesTable nodes={mockNodes} loading={false} />)
    expect(screen.getByTestId('totalKeys-value-max')).toHaveTextContent(
      mockNodes[2].totalKeys.toString(),
    )
  })

  it('should not highlight max value for opsPerSecond with equals values', () => {
    render(<ClusterNodesTable nodes={mockNodes} loading={false} />)
    expect(
      screen.queryByTestId('opsPerSecond-value-max'),
    ).not.toBeInTheDocument()
  })

  it('should render background color for each node', () => {
    render(<ClusterNodesTable nodes={mockNodes} loading={false} />)
    mockNodes.forEach(({ letter, color }) => {
      expect(screen.getByTestId(`node-color-${letter}`)).toHaveStyle({
        'background-color': rgb(color),
      })
    })
  })
})
