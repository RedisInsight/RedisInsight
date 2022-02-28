import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import Graphd3 from './graphd3';
import {responseParser} from './parser';
import * as Utils from './utils';

import {
  EuiButtonIcon,
  EuiToolTip,
} from '@elastic/eui'

interface ISelectedEntityProps {
  property: string
  color: string
  backgroundColor: string
  props: { [key: string]: string | number | object }
}

export default function Graph2(props: { graphKey: string, data: any[] }) {

  const d3Container = useRef<HTMLDivElement>()
  const [container, setContainer] = useState(null)
  const [selectedEntity, setSelectedEntity] = useState<ISelectedEntityProps | null>(null)
  const [start, setStart] = useState(false)

  const colorPicker =  (COLORS: Utils.IGoodColor[]) => {
    const color = new Utils.GoodColorPicker(COLORS)
    return (label: string) => color.getColor(label)
  }

  const labelColors = colorPicker(Utils.NODE_COLORS)
  const edgeColors = colorPicker(Utils.EDGE_COLORS)

  const parsedResponse = responseParser(props.data)
  let nodeIds = parsedResponse.nodes.map(n => n.id)
  let data = {
    results: [{
      columns: parsedResponse.headers,
      data: [{
        graph: {
          nodes: parsedResponse.nodes,
          relationships: parsedResponse.edges.filter(e => nodeIds.includes(e.source) && nodeIds.includes(e.target)).map(e => ({ ...e, startNode: e.source, endNode: e.target }))
        }
      }]
    }],
    errors: [],
  }

  const [graphData, setGraphData] = useState(data)

  useMemo(async () => {

    let newGraphData = graphData

    if (parsedResponse.nodeIds.length > 0) {
      /* Fetch named path nodes */
      const resp = await globalThis.PluginSDK?.executeRedisCommand(`graph.ro_query "${props.graphKey}" "MATCH (n) WHERE id(n) IN [${parsedResponse.nodeIds}] RETURN n"`);

      if (Array.isArray(resp) && (resp.length >= 1 || resp[0].status === 'success')) {
        const parsedData = responseParser(resp[0].response)
        nodeIds = [...new Set(nodeIds.concat(parsedData.nodes.map(n => n.id)))]

        newGraphData = {
          ...newGraphData,
          results: [
            ...newGraphData.results,
            {
              columns: parsedData.headers,
              data: [{
                graph: {
                  nodes: parsedData.nodes,
                  relationships: parsedData.edges.filter(e => nodeIds.includes(e.source) && nodeIds.includes(e.target)).map(e => ({ ...e, startNode: e.source, endNode: e.target }))
                }
              }]
            }
          ]
        }
      }
    }

    /* Fetch neighbours automatically */
    const resp = await globalThis.PluginSDK?.executeRedisCommand(`graph.ro_query "${props.graphKey}" "MATCH (n)-[t]->(m) WHERE ID(n) IN [${nodeIds}] OR ID(m) IN [${nodeIds}] RETURN DISTINCT t"`);

    if (Array.isArray(resp) && (resp.length >= 1 || resp[0].status === 'success')) {
      const parsedData = responseParser(resp[0].response)
      nodeIds = [...new Set(nodeIds.concat(parsedData.nodes.map(n => n.id)))]

      setGraphData({
        ...newGraphData,
        results: [
          ...newGraphData.results,
          {
            columns: parsedData.headers,
            data: [{
              graph: {
                nodes: parsedData.nodes,
                relationships: parsedData.edges.filter(e => nodeIds.includes(e.source) && nodeIds.includes(e.target)).map(e => ({ ...e, startNode: e.source, endNode: e.target }))
              }
            }]
          }
        ]
      })
    }

    setStart(true)
  }, [])


  const zoom = d3.zoom().scaleExtent([0, 3])  /* min, mac of zoom */
  useEffect(() => {
    if (container != null) return;
    if (!start) return;

    const graphd3 = Graphd3(d3Container.current, {
      labelColors,
      edgeColors,
      highlight: [],
      graphZoom: zoom,
      minCollision: 60,
      graphData: graphData,
      infoPanel: true,
      // nodeRadius: 25,
      onLabelNode: (node) => node.properties?.name || node.properties?.title || (node.labels ? node.labels[0] : ''),
      onNodeClick: (nodeSvg, node, event) => {
        if (d3.select(nodeSvg).attr('class').indexOf('selected') > 0) {
          d3.select(nodeSvg)
            .attr('class', 'node');
        } else {
          d3.select(nodeSvg)
            .attr('class', 'node selected');
        }
      },
      async onNodeDoubleClick(nodeSvg, node) {
        /* Get direct neighbours automatically */
        const data = await globalThis.PluginSDK?.executeRedisCommand(`graph.ro_query "${props.graphKey}" "MATCH (n)-[t]-(m) WHERE id(n)=${node.id} RETURN t, m"`)
        if (!Array.isArray(data)) return;
        if (data.length < 1 || data[0].status !== 'success') return;

        const parsedData = responseParser(data[0].response)
        graphd3.updateWithGraphData({
          results: [{
            columns: parsedData.headers,
            data: [{
              graph: {
                nodes: parsedData.nodes,
                relationships: parsedData.edges.map(e => ({ ...e, startNode: e.source, endNode: e.target }))
              }
            }]
          }],
          errors: [],
        });
      },
      onRelationshipDoubleClick(relationship) {
      },
      onDisplayInfo: (infoSvg, node) => {
        let property;
        let color;

        if (node.labels) {
          [property] = node.labels;
          color = labelColors(property).color
        } else {
          property = node.type;
          color = edgeColors(property).color
        }

        setSelectedEntity({
          property,
          backgroundColor: color,
          props: { '<id>': node.id, ...node.properties },
          color: graphd3.invertColor(color)
        })
      },
      zoomFit: false,
    });

    setContainer(graphd3)
  }, [start])

  return (
    <div className="core-container">
      <div className="d3-info">
        {
          parsedResponse.nodes.length > 0 && (
            <div className="d3-info-labels">
                {
                  parsedResponse.labels.map((item, i) => (
                    <div className="d3-info-item" key={item + i}>
                      <div className="node-label" style={{ background: labelColors(item).color }}></div>
                      <div className='label-name' style={{ color: labelColors(item).color }}><code>{item}</code></div>
                    </div>
                  ))
                }
            </div>
          )
        }
        {
          parsedResponse.edges.length > 0 && (
            <div className="d3-info-labels">
              {
                [...(new Set(parsedResponse.edges.map(e => e.type)))].map((item, i) => {
                  return (
                    <div key={item + i.toString()} className="d3-info-item">
                      <div className="edge-label-line" style={{ borderColor: edgeColors(item).color }}></div>
                      <div className="edge-label-arrow" style={{ borderLeftColor: edgeColors(item).color }}></div>
                      <div className="label-name" style={{ color: edgeColors(item).color }}>{item}</div>
                    </div>
                  )
                })
              }
            </div>
          )
        }
        {
          selectedEntity &&
          <div className="info-component">
            <div className="info-header">
              <div className="info-header-type" style={{ backgroundColor: selectedEntity.backgroundColor, color: selectedEntity.color }}>{selectedEntity.property}</div>
              <EuiButtonIcon onClick={() => setSelectedEntity(null)} display="empty" iconType="cross" aria-label="Close" />
            </div>
            <div className="info-props">
              <table>
                {
                  Object.keys(selectedEntity.props).map(k =>
                    <tr>
                      <td>{k}</td>
                      <td>{selectedEntity.props[k]}</td>
                    </tr>
                  )
                }
              </table>
            </div>
          </div>
        }
      </div>
      <div ref={d3Container} id="graphd3" style={{ height: "800px" }}></div>
      <div
        style={{
          position: 'absolute',
          bottom: '110px',
          right: '10px',
          borderRadius: '4px',
          boxShadow: '0 1px 6px rgb(0 0 0 / 16%), 0 1px 6px rgb(0 0 0 / 23%)',
          display: 'flex',
          flexDirection: 'column'
        }}>
        {
          [
            {
              name: 'Zoom In',
              onClick: () => container.zoomFuncs.zoomIn(),
              icon: 'magnifyWithPlus'
            },
            {
              name: 'Zoom Out',
              onClick: () => container.zoomFuncs.zoomOut(),
              icon: 'magnifyWithMinus'
            },
            {
              name: 'Reset Zoom',
              onClick: () => container.zoomFuncs.resetZoom(),
              icon: 'bullseye'
            },
            {
              name: 'Pan Left',
              onClick: () => container.zoomFuncs.panLeft(),
              icon: 'editorItemAlignLeft'
            },
            {
              name: 'Pan Right',
              onClick: () => container.zoomFuncs.panRight(),
              icon: 'editorItemAlignRight'
            },
            {
              name: 'Center',
              onClick: () => container.zoomFuncs.center(),
              icon: 'editorItemAlignCenter'
            },
          ].map(item => (
            <EuiToolTip position="left" content={item.name}>
              <EuiButtonIcon
                onClick={item.onClick}
                iconType={item.icon}
                aria-label={item.name}
              />
            </EuiToolTip>
          ))
        }
      </div>
    </div>
  )
}
