import React, { useEffect, useState, useRef } from 'react'
import { Model, Graph } from '@antv/x6'
import { register} from '@antv/x6-react-shape';
import Hierarchy from '@antv/hierarchy';

import { ParseExplain, ParseProfile } from './parser'
import { ExplainNode, ProfileNode } from './Node';

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
    const info = props.data[0].response[1];
    const resp = ParseProfile(info)
    return (
      <ExplainDraw
        data={resp}
        type={CoreType.Profile}
      />
    )
  }

  const resp = props.data[0].response

  const data = ParseExplain(
    Array.isArray(resp) ? resp.join('\n') : resp.split('\\n').join('\n')
  );
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

function ExplainDraw({data, type}: {data: any, type: CoreType}): JSX.Element {
  const [done, setDone] = useState(false)
  const container = useRef<HTMLDivElement | null>(null)

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
      const b = graph.getAllCellsBBox();
      const width = Math.max(b?.width || 1080, document.body.offsetWidth) + 100
      if (isFullScreen) {
        const height = Math.max(b?.height || 585, parent.document.body.offsetHeight) + 100
        graph.resize(width, height)
      } else {
        graph.resize(width, b?.height || 585)
      }
    }

    window.addEventListener('resize', resize);

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
      nodeSep: 250,
      rankSep: 150,
      subTreeSep: 0,
    })

    const model: Model.FromJSONData = { nodes: [], edges: [] }
    const traverse = (data: any) => {
      if (data) {
        const info = data.data
        model.nodes?.push({
          id: data.id,
          x: (data.x || 0) + document.body.clientWidth / 2,
          y: (data.y || 0) + document.body.clientHeight,
          shape: 'react-explain-node',
          width: 240,
          height: (info.snippet ? 64 : 42),
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
                stroke: '#6B6B6B',
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
    <div style={{ height: '585px', margin: 0, width: '100vw' }} ref={container} id="container"></div>
  )

}
