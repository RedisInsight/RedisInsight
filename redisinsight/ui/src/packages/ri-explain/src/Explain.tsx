import React, { useEffect, useState, useRef } from 'react'
import { Model, Graph } from '@antv/x6'
import { register} from '@antv/x6-react-shape'
import Hierarchy from '@antv/hierarchy'

import { EntityInfo, ParseExplain, ParseProfile, ParseProfileCluster } from './parser'
import { ExplainNode, ProfileNode } from './Node'

interface IExplain {
  command: string
  data: [{response: string[] | string | any}]
}

enum CoreType {
  Profile,
  Explain,
}

export default function Explain(props: IExplain): JSX.Element {
  const command = props.command.split(' ')[0]
  if (command.toLowerCase() == 'ft.profile') {
    const info = props.data[0].response[1]

    let data: EntityInfo;
    let profilingTime: IProfilingTime = {};

    if (info.length > 5 && typeof info[0] === 'string' && info[0].toLowerCase().startsWith('shard')) {
      let cluster: Object;
      [cluster, data] = ParseProfileCluster(info)
      cluster['Coordinator'].forEach((kv: [string, string]) => profilingTime[kv[0]] = kv[1]);
    } else {
      data = ParseProfile(info)
      profilingTime = {
        'Total Profile Time': info[0][1],
        'Parsing Time': info[1][1],
        'Pipeline Creation Time': info[2][1],
      }
    }

    return (
      <ExplainDraw
        data={data}
        type={CoreType.Profile}
        profilingTime={profilingTime}
      />
    )
  }

  const resp = props.data[0].response

  const data = ParseExplain(
    Array.isArray(resp) ? resp.join('\n') : resp.split('\\n').join('\n')
  )
  return (
    <ExplainDraw
      data={data}
      type={CoreType.Explain}
    />
  )
}

register({
  shape: 'react-explain-node',
  width: 100,
  height: 100,
  component: ExplainNode as any
})

register({
  shape: 'react-profile-node',
  width: 100,
  height: 100,
  component: ProfileNode as any,
})

const isDarkTheme = document.body.classList.contains('theme_DARK')

interface IProfilingTime {
  [key: string]: string
}

function ExplainDraw({data, type, profilingTime}: {data: any, type: CoreType, profilingTime?: IProfilingTime}): JSX.Element {
  const container = useRef<HTMLDivElement | null>(null)

  const [done, setDone] = useState(false)
  const [infoWidth, setInfoWidth] = useState(document.body.offsetWidth)

  useEffect(() => {

    if (done) return
    setDone(true)

    const graph = new Graph({
      container: container?.current as HTMLElement,
      autoResize: false,
      interacting: false,
      background: {
        color: isDarkTheme ? 'black' : 'white',
      },
      panning: {
        enabled: true,
        modifiers:  ['ctrl'],
      },
      translating: {
        restrict: true,
      },
      async: true,
      virtual: true,
    })

    graph.on("resize", () => graph.centerContent())

    function resize() {
      const isFullScreen = parent.document.body.getElementsByClassName('fullscreen').length > 0
      const b = graph.getAllCellsBBox()
      const width = Math.max((b?.width || 1080) + 100, document.body.offsetWidth)
      if (isFullScreen) {
        const height = Math.max((b?.height || 585) + 100, parent.document.body.offsetHeight)
        graph.resize(width, height)
      } else {
        graph.resize(width, (b?.height || 585) + 100)
      }
      setInfoWidth(width)
    }
    
    resize()

    window.addEventListener('resize', resize)

    const result = Hierarchy.dendrogram(data, {
      direction: 'BT',
      getHeight() {
        return 200
      },
      getWidth() {
        return 250
      },
      getHGap() {
        return 0
      },
      getVGap() {
        return 0
      },
      nodeSep: type === CoreType.Explain ? 250 : 350,
      rankSep: 150,
      subTreeSep: 0,
    })

    const model: Model.FromJSONData = { nodes: [], edges: [] }
    const traverse = (data: any) => {
      if (data) {
        const info = data.data

        let nodeProps = {
          shape: 'react-explain-node',
          width: 240,
          height: (info.snippet ? 64 : 42),
        }
        if (type === CoreType.Profile) {
          nodeProps = {
            shape: 'react-profile-node',
            width: 320,
            height: 84,
          }
        }


        model.nodes?.push({
          id: data.id,
          x: (data.x || 0) + document.body.clientWidth / 2,
          y: (data.y || 0) + document.body.clientHeight,
          ...nodeProps,
          data: info,
          attrs: {
            body: {
              fill: isDarkTheme ? '#5F95FF' : '#8992B3',
              stroke: 'transparent',
            },
          },
        })
      }
      if (data.children) {
        data.children.forEach((item: any) => {
          model.edges?.push({
            id: `${data.id}-${item.id}`,
            source: data.id,
            target: item.id,
            router: {
              name: 'manhattan',
              args: {
                startDirections: ['top'],
                endDirections: ['bottom'],
                // cost: 33,
                // step: 10,
                padding: {
                  top: 15,
                  bottom: 10,
                  right: 20,
                  left: 10,
                }
              },
            },
            attrs: {
              line: {
                stroke: isDarkTheme ? '#6B6B6B' : '#8992B3',
                strokeWidth: 1,
                targetMarker: null,
              },
            },
          })
          traverse(item)
        })
      }
    }
    traverse(result)

    graph.fromJSON(model)

    graph.centerContent()

  }, [done])

  return (
    <div>
      <div style={{ margin: 0, width: '100vw' }} ref={container} id="container" />
      { profilingTime && (
        <div style={{ width: infoWidth}} id="profile-time-info" className="ProfileTimeInfo">
          {
            Object.keys(profilingTime).map(key => (
              <div className="Item">
                <div className="Value">{profilingTime[key]}</div>
                <div className="Key">{key}</div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  )
}
