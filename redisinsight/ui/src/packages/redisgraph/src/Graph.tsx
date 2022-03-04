import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import Graphd3 from './graphd3';
import {responseParser} from './parser';
import * as Utils from './utils';
import { executeRedisCommand  } from 'redisinsight-plugin-sdk'

import {
  EuiButtonIcon,
  EuiToolTip,
} from '@elastic/eui'

enum EntityType {
  Node = 'Node',
  Edge = 'Edge'
}

interface ISelectedEntityProps {
  property: string
  color: string
  backgroundColor: string
  props: { [key: string]: string | number | object }
  type: EntityType
}

const isDarkTheme = document.body.classList.contains('theme_DARK')

const colorPicker =  (COLORS: Utils.IGoodColor[]) => {
  const color = new Utils.GoodColorPicker(COLORS)
  return (label: string) => color.getColor(label)
}

const labelColors = colorPicker(isDarkTheme ? Utils.NODE_COLORS_DARK : Utils.NODE_COLORS)
const edgeColors = colorPicker(isDarkTheme ? Utils.EDGE_COLORS_DARK : Utils.EDGE_COLORS)

export default function Graph(props: { graphKey: string, data: any[] }) {

  const d3Container = useRef<HTMLDivElement>()
  const [container, setContainer] = useState(null)
  const [selectedEntity, setSelectedEntity] = useState<ISelectedEntityProps | null>(null)
  const [start, setStart] = useState(false)

  const parsedResponse = responseParser(props.data)
  let nodeIds = new Set(parsedResponse.nodes.map(n => n.id))
  let edgeIds = new Set(parsedResponse.edges.map(e => e.id))
  let data = {
    results: [{
      columns: parsedResponse.headers,
      data: [{
        graph: {
          nodes: parsedResponse.nodes,
          relationships: parsedResponse.edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target)).map(e => ({ ...e, startNode: e.source, endNode: e.target }))
        }
      }]
    }],
    errors: [],
  }

  const [nodeLabels, setNodeLabels] = useState(parsedResponse.labels)
  const [edgeTypes, setEdgeTypes] = useState(parsedResponse.types)

  const [graphData, setGraphData] = useState(data)

  useMemo(async () => {

    let newGraphData = graphData
    let newNodeLabels: {[key: string]: number} = nodeLabels
    let newEdgeTypes: {[key: string]: number} = edgeTypes

    if (parsedResponse.nodeIds.length > 0) {
      try {
        /* Fetch named path nodes */
        const resp = await executeRedisCommand(`graph.ro_query "${props.graphKey}" "MATCH (n) WHERE id(n) IN [${[...parsedResponse.nodeIds]}] RETURN n"`);

        if (Array.isArray(resp) && (resp.length >= 1 || resp[0].status === 'success')) {
          const parsedData = responseParser(resp[0].response)
          parsedData.nodes.forEach(n => {
            nodeIds.add(n.id)
            n.labels.forEach(l => newNodeLabels[l] = (newNodeLabels[l] + 1) || 1)
          })
          parsedData.edges.forEach(e => newEdgeTypes[e.type] = (newEdgeTypes[e.type] + 1) || 1)

          newGraphData = {
            ...newGraphData,
            results: [
              ...newGraphData.results,
              {
                columns: parsedData.headers,
                data: [{
                  graph: {
                    nodes: parsedData.nodes,
                    relationships: parsedData.edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target) && !edgeIds.has(e.id)).map(e => ({ ...e, startNode: e.source, endNode: e.target }))
                  }
                }]
              }
            ]
          }
        }
      } catch {}
    }

    try {
      /* Fetch neighbours automatically */
      const resp = await executeRedisCommand(`graph.ro_query "${props.graphKey}" "MATCH (n)-[t]->(m) WHERE ID(n) IN [${[...nodeIds]}] OR ID(m) IN [${[...nodeIds]}] RETURN DISTINCT t"`);

      if (Array.isArray(resp) && (resp.length >= 1 || resp[0].status === 'success')) {
        const parsedData = responseParser(resp[0].response)
        parsedData.nodes.forEach(n => {
          nodeIds.add(n.id)
          n.labels.forEach(l => newNodeLabels[l] = (newNodeLabels[l] + 1) || 1)
        })
        const filteredEdges = parsedData.edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target) && !edgeIds.has(e.id)).map(e => ({ ...e, startNode: e.source, endNode: e.target }))
        filteredEdges.forEach(e => newEdgeTypes[e.type] = (newEdgeTypes[e.type] + 1) || 1)

        setGraphData({
          ...newGraphData,
          results: [
            ...newGraphData.results,
            {
              columns: parsedData.headers,
              data: [{
                graph: {
                  nodes: parsedData.nodes,
                  relationships: filteredEdges,
                }
              }]
            }
          ]
        })
      }
    } catch {}

    setNodeLabels(newNodeLabels)
    setEdgeTypes(newEdgeTypes)

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
        const data = await executeRedisCommand(`graph.ro_query "${props.graphKey}" "MATCH (n)-[t]-(m) WHERE id(n)=${node.id} RETURN t, m"`)
        if (!Array.isArray(data)) return;
        if (data.length < 1 || data[0].status !== 'success') return;
        const parsedData = responseParser(data[0].response)

        let newNodeLabels = nodeLabels
        let newEdgeTypes = edgeTypes

        parsedData.nodes.forEach(n => {
          nodeIds.add(n.id)
          n.labels.forEach(l => newNodeLabels[l] = (newNodeLabels[l] + 1) || 1)
        })
        const filteredEdges = parsedData.edges.filter(e => !edgeIds.has(e.id)).map(e => ({ ...e, startNode: e.source, endNode: e.target }))
        filteredEdges.forEach(e => newEdgeTypes[e.type] = (newEdgeTypes[e.type] + 1) || 1)

        graphd3.updateWithGraphData({
          results: [{
            columns: parsedData.headers,
            data: [{
              graph: {
                nodes: parsedData.nodes,
                relationships: filteredEdges,
              }
            }]
          }],
          errors: [],
        })

        setNodeLabels(newNodeLabels)
        setEdgeTypes(newEdgeTypes)

      },
      onRelationshipDoubleClick(relationship) {
      },
      onDisplayInfo: (infoSvg, entity) => {
        let property: string;
        let entityColor: Utils.IGoodColor;
        let t: EntityType;

        if (entity.labels) {
          [property] = entity.labels;
          entityColor = labelColors(property)
          t = EntityType.Node
        } else {
          property = entity.type;
          entityColor = edgeColors(property)
          t = EntityType.Edge
        }

        setSelectedEntity({
          property,
          type: t,
          backgroundColor: entityColor.color,
          props: { '<id>': entity.id, ...entity.properties },
          color: entityColor.textColor
        })
      },
      zoomFit: false,
    });

    setContainer(graphd3)
  }, [start])

  return (
    <div className="core-container">
      <div className="d3-info">
        <div className="graph-legends">
          {
            Object.keys(nodeLabels).length > 0 && (
              <div className="d3-info-labels">
                {
                  Object.keys(nodeLabels).map((item, i) => (
                    <div
                      className="box-node-label"
                      style={{backgroundColor: labelColors(item).color, color: labelColors(item).textColor}}
                      key={item + i}
                    >
                      {item}
                    </div>
                  ))
                }
            </div>
            )
          }
          {
            Object.keys(edgeTypes).length > 0 && (
              <div className="d3-info-labels">
                {
                  Object.keys(edgeTypes).map((item, i) => (
                    <div
                      key={item + i.toString()}
                      className="box-edge-type"
                      style={{ borderColor: edgeColors(item).color, color: edgeColors(item).color }}
                    >
                      {item}
                    </div>
                  ))
                }
              </div>
            )
          }
        </div>
        {
          selectedEntity &&
          <div className="info-component">
            <div className="info-header">
              {
                selectedEntity.type === EntityType.Node ?
                <div className="box-node-label" style={{ backgroundColor: selectedEntity.backgroundColor, color: selectedEntity.color }}>{selectedEntity.property}</div>
                :
                <div className='box-edge-type' style={{borderColor: selectedEntity.backgroundColor, color: selectedEntity.backgroundColor }}>{selectedEntity.property}</div>
              }
              <EuiButtonIcon color="text" onClick={() => setSelectedEntity(null)} display="empty" iconType="cross" aria-label="Close" />
            </div>
            <div className="info-props">
              {
                Object.keys(selectedEntity.props).map(k => [k, selectedEntity.props[k]]).reduce(
                  (a, b) => a.concat(b), []
                ).map(k =>
                    <div>{k}</div>
                )
              }
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
              name: 'Center',
              onClick: () => container.zoomFuncs.center(),
              icon: 'editorItemAlignCenter'
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
    </div>
  )
}
