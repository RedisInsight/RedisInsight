import React, { useEffect, useState, useRef } from 'react'
import { Model, Graph } from '@antv/x6'
import { register} from '@antv/x6-react-shape'
import Hierarchy from '@antv/hierarchy'

import {
  EuiButtonIcon,
  EuiToolTip,
  EuiIcon,
} from '@elastic/eui'

import {
  CoreType,
  ModuleType,
  EntityInfo,
  ParseExplain,
  ParseGraphV2,
  ParseProfile,
  ParseProfileCluster,
  GetAncestors,
  GetTotalExecutionTime,
} from './parser'
import { ExplainNode, ProfileNode } from './Node'

interface IExplain {
  command: string
  data: [{response: string[] | string | any}]
}

function getEdgeSize(c: number) {
  return Math.floor(Math.log(c || 1) + 1)
}

export default function Explain(props: IExplain): JSX.Element {
  const command = props.command.split(' ')[0].toLowerCase()

  if (command.startsWith('graph')) {
    const info  = props.data[0].response
    const resp = ParseGraphV2(info)

    let profilingTime: IProfilingTime = {}
    let t = command.endsWith('explain') ? CoreType.Explain : CoreType.Profile
    if (t === CoreType.Profile) {
      profilingTime = {
        'Total Execution Time': GetTotalExecutionTime(resp)
      }
    }

    return (
      <ExplainDraw
        data={resp}
        module={ModuleType.Graph}
        type={t}
        profilingTime={profilingTime}
      />
    )
  }

  const module = ModuleType.Search

  if (command == 'ft.profile') {
    const info = props.data[0].response[1]

    let data: EntityInfo
    let profilingTime: IProfilingTime = {}

    if (info.length > 5 && typeof info[0] === 'string' && info[0].toLowerCase().startsWith('shard')) {
      let [cluster, entityInfo] = ParseProfileCluster(info)
      cluster['Coordinator'].forEach((kv: [string, string]) => profilingTime[kv[0]] = kv[1])
      data = entityInfo
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
        module={module}
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
      module={module}
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

function ExplainDraw({data, type, module, profilingTime}: {data: any, type: CoreType, module: ModuleType, profilingTime?: IProfilingTime}): JSX.Element {
  const container = useRef<HTMLDivElement | null>(null)

  const [done, setDone] = useState(false)
  const [collapse, setCollapse] = useState(true)
  const [infoWidth, setInfoWidth] = useState(document.body.offsetWidth)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [core, setCore] = useState<Graph>()

  function resize() {
    const isFullScreen = parent.document.body.getElementsByClassName('fullscreen').length > 0
    const b = core?.getAllCellsBBox()
    const width = Math.max((b?.width || 1080) + 100, document.body.offsetWidth)
    if (isFullScreen) {
      setIsFullScreen(true)
      const height = Math.max((b?.height || 585) + 100, parent.document.body.offsetHeight)
      if (collapse) {
        core?.resize(width, window.outerHeight - 250)
        core?.positionContent("top")
      } else {
        core?.resize(width, height)
      }
    } else {
      setIsFullScreen(false)
      if (collapse) {
        core?.resize(width, 400)
        core?.positionContent("top")
      } else {
        core?.resize(width, (b?.height || 585) + 100)
      }
    }
    setInfoWidth(width)
  }

  window.addEventListener('resize', resize)
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
      translating: {
        restrict: true,
      },
      async: true,
      virtual: true,
    })

    setCore(graph)

    graph.on("resize", () => graph.centerContent())
    graph.on("node:mouseenter", x => {
      const {id} = x.node.getData()
      // Find ancestors of a node
      const ancestors = GetAncestors(data, id, {found: false, pairs: []})
      ancestors.pairs.forEach(p => {
        // Highlight ancestor and their ancestor
        document.querySelector(`#node-${p[0]}`)?.setAttribute("style", "outline: 1px solid #85A2FE !important;")

        // Get edge size of parent ancestor to apply the right edge stroke
        const strokeSize = getEdgeSize(parseInt((document.querySelector(`#node-${p[1]}`) as HTMLElement)?.dataset?.size || '')) + 1
        document.querySelector(`[data-cell-id='${p[0]}-${p[1]}']`)?.childNodes.forEach(k =>
          (k as HTMLElement)
            .setAttribute(
              "style",
              `stroke: #85A2FE; stroke-linecap: butt; stroke-width: ${strokeSize}px`
            )
        )
      })
    })

    const ele = document.querySelector("#container-parent")

    let pos = { top: 0, left: 0, x: 0, y: 0 }

    const mouseMoveHandler = function (e) {
      // How far the mouse has been moved
      const dx = e.clientX - pos.x
      const dy = e.clientY - pos.y

      // Scroll the element
      if (ele) {
        ele.scrollTop = pos.top - dy
        ele.scrollLeft = pos.left - dx
      }
    }


    const mouseUpHandler = function () {
      document.removeEventListener('mousemove', mouseMoveHandler)
      document.removeEventListener('mouseup', mouseUpHandler)
    }


    const mouseDownHandler = function (e) {
      pos = {
        // The current scroll
        left: ele?.scrollLeft || 0,
        top: ele?.scrollTop || 0,
        // Get the current mouse position
        x: e.clientX,
        y: e.clientY,
      }

      document.addEventListener('mousemove', mouseMoveHandler)
      setTimeout(() => document.addEventListener('mouseup', mouseUpHandler), 100)
    }

    ele?.addEventListener('mousedown', mouseDownHandler)

    graph.on("node:mouseleave", x => {
      const {id} = x.node.getData()
      const ancestors = GetAncestors(data, id, {found: false, pairs: []})
      ancestors.pairs.forEach(p => {
        document.querySelector(`#node-${p[0]}`)?.setAttribute("style", "")
        document.querySelector(`[data-cell-id='${p[0]}-${p[1]}']`)?.childNodes.forEach(k => (k as HTMLElement).setAttribute("style", ""))
      })
    })

    resize()

    const result = Hierarchy.compactBox(data, {
      direction: 'BT',
      getHeight() {
        return 200
      },
      getWidth() {
        return 250
      },
      getHGap() {
        return 50
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
        const info = data.data as EntityInfo

        if (!info.snippet && info.parentSnippet && info.data?.startsWith(info.parentSnippet)) {
          info.data = info.data.substr(info.parentSnippet.length)
          info.snippet = info.parentSnippet
        }

        if (module === ModuleType.Graph) {
          info.recordsProduced = info.counter
          delete info.counter
          delete info.size
        }

        let nodeProps = {
          shape: 'react-explain-node',
          width: 240,
          height: (info.snippet ? 64 : 42),
        }
        if (type === CoreType.Profile) {
          nodeProps = {
            shape: 'react-profile-node',
            width: 320,
            height: (info.snippet ? 114 : 86),
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
          const itemRecords = parseInt(item.data.counter || 0)

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
                strokeWidth: getEdgeSize(itemRecords),
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

  if (collapse) {
    core?.resize(undefined, isFullScreen ? (window.outerHeight - 250) : 400)
    core?.positionContent("top")
  } else {
    core?.resize(undefined, core?.getContentBBox().height + 100)
  }

  return (
    <div>
      { collapse && <div style={{ paddingTop: '50px' }}></div> }
      <div id="container-parent" style={{ height: isFullScreen ? (window.outerHeight - 170) + 'px' : collapse ? '500px' : '585px', width: '100%', overflow: 'auto' }}>
        <div style={{ margin: 0, width: '100vw' }} ref={container} id="container" />
        { !collapse && (
          <div className="ZoomMenu">
            {
              [
                {
                  name: 'Zoom In',
                  onClick: () => {
                    core?.zoom(0.5)
                    core?.resize(undefined, core?.getContentBBox().height + 50)
                  },
                  icon: 'magnifyWithPlus'
                },
                {
                  name: 'Zoom Out',
                  onClick: () => {
                    core && Math.floor(core.zoom()) <= 0.5 ? core?.zoom(0) : core?.zoom(-0.5)
                    core?.resize(undefined, core?.getContentBBox().height + 50)
                  },
                  icon: 'magnifyWithMinus'
                },
                {
                  name: 'Reset Zoom',
                  onClick: () => {
                    core?.zoomTo(1)
                    core?.resize(undefined, core?.getContentBBox().height + 50)
                  },
                  icon: 'bullseye'
                },
              ].map(item => (
                <EuiToolTip position="left" content={item.name}>
                  <EuiButtonIcon
                    color='text'
                    onClick={item.onClick}
                    iconType={item.icon}
                    aria-label={item.name}
                  />
                </EuiToolTip>
              ))
            }
          </div>
        )}
        <div
          style={{ paddingBottom: (isFullScreen && profilingTime && ModuleType.Search ? '60px' : '35px')}}
          className="CollapseButton"
          onClick={e => {
            e.preventDefault()
            if (!collapse) {     // About to collapse?
              core?.zoomTo(1)
              core?.resize(undefined, core?.getContentBBox().height + 50)
            }
            setCollapse(!collapse)
          }}
        >
         {
           collapse
             ?
             <>
               <div>Expand</div>
               <EuiIcon className="NodeIcon" size="m" type="arrowDown" />
             </>
             :
             <>
               <div>Collapse</div>
               <EuiIcon className="NodeIcon" size="m" type="arrowUp" />
             </>           
         }
        </div>
        { profilingTime &&
          (
            module === ModuleType.Search ?
              (
                <div style={{ width: infoWidth }} className="ProfileInfo ProfileTimeInfo">
                  {
                    Object.keys(profilingTime).map(key => (
                      <div className="Item">
                        <div className="Value">{profilingTime[key]}</div>
                        <div className="Key">{key}</div>
                      </div>
                    ))
                  }
                </div>
              )
              :
              type === CoreType.Profile && (
                <div style={{ width: infoWidth }} className="ProfileInfo ProfileTimeMini">Total execution time: {profilingTime['Total Execution Time']} ms</div>
              )
          )}
      </div>
    </div>
  )
}
