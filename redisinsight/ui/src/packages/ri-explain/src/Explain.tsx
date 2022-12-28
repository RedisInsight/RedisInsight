import React, { useEffect, useState, useRef } from 'react'
import { Model, Graph } from '@antv/x6'
import { register} from '@antv/x6-react-shape';
import Hierarchy from '@antv/hierarchy';

import { AntHierarchyInput, ASTToJson } from './parser'
import { ExplainNode } from './Node';

interface IExplain {
  data: [{response: string[] | string}]
}

export default function Explain(props: IExplain): JSX.Element {

  const resp = props.data[0].response

  return (
    <ExplainDraw
      data={
        Array.isArray(resp) ? resp.join('\n') : resp.split('\\n').join('\n')
      }
    />
  )
}

register({
  shape: 'react-node',
  width: 100,
  height: 100,
  component: ExplainNode as any
})

const isDarkTheme = document.body.classList.contains('theme_DARK')

function ExplainDraw(props: {data: any}): JSX.Element {
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

    graph.on("resize", () => {
      graph.centerContent()
    })

    function resize() {
      const isFullScreen = parent.document.body.getElementsByClassName('fullscreen').length > 0
      if (isFullScreen) {
        graph.resize(document.body.offsetWidth, parent.document.body.offsetHeight)
      } else {
        graph.resize(document.body.offsetWidth, 585)
      }
    }

    window.addEventListener('resize', resize);

    let data = ASTToJson(props.data);

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
        const myData = data.data
        model.nodes?.push({
          id: data.id,
          x: (data.x || 0) + document.body.clientWidth / 2,
          y: (data.y || 0) + document.body.clientHeight,
          shape: 'react-node',
          width: 240,
          height: (myData.snippet ? 64 : 42),
          label: data.id.toString(),
          data: {...myData, label: myData.data.data, type: myData.data.type},
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
    // graph.centerContent()

    graph.centerContent()
    // scroller.enableAutoResize()
    // scroller.center()
    // scroller.scrollToContent()

    // scroller.enableAutoResize()
    // scroller.center()
    // scroller.resize(1636)
    // scroller.centerContent()
    // graph.center()
    // graph.centerContent()



  }, [done])

  return (
    <div style={{ height: '585px', width: `100vw`, margin: 0 }} ref={container} id="container"></div>
  )

}
