import * as d3 from 'd3';
import * as Utils from './utils';

import {
  NODE_STROKE_WIDTH,
  NODE_RADIUS,
  ZOOM_PROPS,
} from './constants'

const DEFAULT_OPTIONS = {
  arrowSize: 5,
  highlight: undefined,
  minCollision: undefined,
  graphData: undefined,
  nodeOutlineFillColor: undefined,
  nodeRadius: 25,
  relationshipColor: '#a5abb6',
  zoomFit: false,
  labelProperty: 'name',
  infoPanel: false,
};

const COLORS = [
  '#68bdf6', // light blue
  '#6dce9e', // green #1
  '#faafc2', // light pink
  '#f2baf6', // purple
  '#ff928c', // light red
  '#fcea7e', // light yellow
  '#ffc766', // light orange
  '#405f9e', // navy blue
  '#a5abb6', // dark gray
  '#78cecb', // green #2,
  '#b88cbb', // dark purple
  '#ced2d9', // light gray
  '#e84646', // dark red
  '#fa5f86', // dark pink
  '#ffab1a', // dark orange
  '#fcda19', // dark yellow
  '#797b80', // black
  '#c9d96f', // pistacchio
  '#47991f', // green #3
  '#70edee', // turquoise
  '#ff75ea', // pink
];

interface INode extends d3.SimulationNodeDatum {
    id: string
    properties: { [key: string]: string | number | object }
    labels: string[]
    color: string
}

interface IRelationship extends d3.SimulationLinkDatum<INode>{
  id: string
  properties: { [key: string]: string | number | object }
  type: string
  startNode: string
  endNode: string
  source: INode
  target: INode
}

function GraphD3(_selector: HTMLDivElement, _options: any) {
  let info: any;
  let nodes: INode[];
  let relationship: d3.Selection<SVGGElement, IRelationship, SVGGElement, any>;
  let relationshipOutline;
  let relationshipOverlay;
  let relationshipText;
  let relationships: IRelationship[];
  let selector: HTMLDivElement;
  let simulation: d3.Simulation<any, any>;
  let svg: d3.Selection<any, unknown, null, undefined>;
  let svgNodes: d3.Selection<d3.BaseType | SVGPathElement, any, SVGGElement, unknown>;
  let svgRelationships: d3.Selection<d3.BaseType | SVGGElement, any, SVGGElement, unknown>;
  let svgScale: number;
  let svgTranslate: number[];
  let node: any;
  let justLoaded = false;
  const VERSION = '2.0.0';

  let zoomFuncs = {}

  const options = { ...DEFAULT_OPTIONS, ..._options };
  let zoom: d3.ZoomBehavior<Element, unknown> = options.graphZoom

  const {labelColors, edgeColors} = options


  function color() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  function version() {
    return VERSION;
  }

  function appendGraph(container: d3.Selection<any, unknown, null, undefined>) {
    var mainSvg = container.append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('class', 'graphd3-graph')
      .call(options.graphZoom.on('zoom', (event) => {
        let scale = event.transform.k;
        const translate = [event.transform.x, event.transform.y];

        if (svgTranslate) {
          translate[0] += svgTranslate[0];
          translate[1] += svgTranslate[1];
        }

        if (svgScale) {
          scale *= svgScale;
        }

        svg.attr('transform', `translate(${translate[0]}, ${translate[1]}) scale(${scale})`);
      }))
    .on('dblclick.zoom', null)


      svg = mainSvg.append('g')
      .attr('width', '100%')
      .attr('height', '100%');

    zoomFuncs = {
      zoomIn: () => mainSvg.transition().call(zoom.scaleBy, ZOOM_PROPS.ZOOM_IN),
      zoomOut: () => mainSvg.transition().call(zoom.scaleBy, ZOOM_PROPS.ZOOM_OUT),
      resetZoom: () => mainSvg.transition().call(zoom.scaleTo, ZOOM_PROPS.ZOOM_RESET),
      center: () => mainSvg.transition().call(zoom.translateTo, ...ZOOM_PROPS.CAMERA_CENTER(mainSvg.node().getBoundingClientRect().width, mainSvg.node().getBoundingClientRect().height)),
    }

    svgRelationships = svg.append('g')
      .attr('class', 'relationships');

    svgNodes = svg.append('g')
      .attr('class', 'nodes');
  }

  function appendInfoPanel(container) {
    return container.append('div')
      .attr('class', 'd3-info');
  }

  function appendInfoElement(className, nodeData) {
    let colorNode;
    let property;

    if (nodeData.labels) {
      [property] = nodeData.labels;
      colorNode = nodeData.color;
    } else {
      colorNode = '#808080';
      property = nodeData.type;
    }

    info.append('span')
      .attr('class', className)
      .html(`<strong>${property}</strong>`)
      .style('background-color', colorNode)
      .style('border-color', Utils.darkenColor(colorNode))
      .style('color', Utils.invertColor(colorNode));
  }

  function appendInfoElementProperty(cls, property, value) {
    info.append('span').attr('class', cls)
      .html(`<strong>${property}</strong> ${value}`);
  }

  function stickNode(event, d) {
    /* eslint-disable */
    d.fx = event.x;
    d.fy = event.y;
    /* eslint-enable */
  }

  function dragEnded(event, d) {
    if (!event.active) {
      simulation.alphaTarget(0);
    }

    if (typeof options.onNodeDragEnd === 'function') {
      options.onNodeDragEnd(this, d, event);
    }
  }

  function dragged(event, d) {
    stickNode(event, d);
  }

  function dragStarted(event, d) {
    if (!event.active) {
      simulation.alphaTarget(0.3).restart();
    }
    /* eslint-disable */
    d.fx = d.x;
    d.fy = d.y;
    /* eslint-enable */

    if (typeof options.onNodeDragStart === 'function') {
      options.onNodeDragStart(this, d, event);
    }
  }

  function clearInfo() {
    info.html('');
  }

  function updateInfo(d) {
    clearInfo();

    if (typeof options.onDisplayInfo === 'function') {
      options.onDisplayInfo(info, d);
      return;
    }

    appendInfoElement('class', d);
    appendInfoElementProperty('property', '&lt;id&gt;', d.id);

    Object.keys(d.properties).forEach((property) => {
      appendInfoElementProperty('property', property, JSON.stringify(d.properties[property]));
    });
  }

  function appendNode() {
    return node.enter()
      .append('g')
      .attr('class', (d) => {
        const label = d.labels[0];
        let classes = 'node';
        let highlight;

        if (options.highlight) {
          for (let i = 0; i < options.highlight.length; i += 1) {
            highlight = options.highlight[i];

            if (label === highlight.class && d.properties[highlight.property] === highlight.value) {
              classes += ' node-highlighted';
              break;
            }
          }
        }

        return classes;
      })
      .on('click', function onNodeClick(event, d) {
        /* eslint-disable */
        d.fx = null;
        d.fy = null;
        /* eslint-enable */

        if (typeof options.onNodeClick === 'function') {
          options.onNodeClick(this, d, event);
        }
      })
      .on('dblclick', function onNodeDoubleClick(event, d) {
        stickNode(event, d);

        if (typeof options.onNodeDoubleClick === 'function') {
          options.onNodeDoubleClick(this, d, event);
        }

        d3.select('.graphd3-graph').transition().call(zoom.translateTo as any, d.x, d.y)
      })
      .on('mouseenter', function onNodeMouseEnter(event, d) {
        if (info) {
          updateInfo(d);
        }

        if (typeof options.onNodeMouseEnter === 'function') {
          options.onNodeMouseEnter(this, d, event);
        }
      })
      .on('mouseleave', function onNodeMouseLeave(event, d) {
        if (info) {
          // clearInfo(d);
        }

        if (typeof options.onNodeMouseLeave === 'function') {
          options.onNodeMouseLeave(this, d, event);
        }
      })
      .call(d3.drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded));
  }

  function appendRingToNode(svgNode) {
    return svgNode.append('circle')
      .attr('class', 'ring')
      .attr('r', options.nodeRadius * 1.16);
  }

  function appendOutlineToNode(svgNode) {
    return svgNode.append('circle')
      .attr('class', 'outline')
      .attr('r', options.nodeRadius)
      .style('fill', (d) => labelColors(d.labels[0]).color)
      .style('stroke', (d) => labelColors(d.labels[0]).borderColor);
  }

  function appendNodeInfo(svgNode) {
    if (!options.onNodeInfoClick) {
      return;
    }

    const g = svgNode.append('g')
      .attr('class', 'info')
      .attr('transform', 'translate(9, -28)')
      .on('click', function onNodeInfoClick(event, d) {
        if (typeof options.onNodeInfoClick === 'function') {
          options.onNodeInfoClick(this, d, event);
        }
      });

    g.append('rect')
      .attr('width', '20px')
      .attr('height', '20px')
      .style('fill', '#444')
      .style('stroke', '#54b3ff')
      .attr('rx', 10)
      .attr('ry', 10);

    g.append('text')
      .text('i')
      .attr('fill', 'white')
      .attr('font-size', 11)
      .attr('x', '9')
      .attr('y', '14');
  }

  function appendTextToNode(svgNode) {
    svgNode.append('text')
      .text((d) => {
        let label;

        if (typeof options.onLabelNode === 'function') {
          label = options.onLabelNode(d);
        } else {
          label = d.properties?.name || (d.labels ? d.labels[0] : '');
        }

        return label.length > 10 ? Utils.truncateText(label, 10) : label;
      })
      .attr('class', 'text')
      .attr('font-size', '10px')
      .attr('fill', (d) => labelColors(d.labels[0]).textColor)
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .attr('dy', () => options.nodeRadius / ((options.nodeRadius * 25) / 100));
  }

  function appendNodeToGraph() {
    const n = appendNode();

    appendRingToNode(n);
    appendOutlineToNode(n);
    appendNodeInfo(n);
    appendTextToNode(n);

    return n;
  }

  function contains(array, id) {
    const filter = array.filter((elem) => elem.id === id);

    return filter.length > 0;
  }

  function appendRelationship() {
    return relationship.enter()
      .append('g')
      .attr('class', 'relationship')
      .on('dblclick', function onRelationshipDoubleClick(event, d) {
        if (typeof options.onRelationshipDoubleClick === 'function') {
          options.onRelationshipDoubleClick(this, d, event);
        }
      })
      .on('mouseenter', (event, d) => {
        if (info) {
          updateInfo(d);
        }
      });
  }

  function appendOutlineToRelationship(r) {
    return r.append('path')
      .attr('class', 'outline')
      .attr('fill', d => edgeColors(d.type).color);
  }

  function appendOverlayToRelationship(r) {
    return r.append('path')
      .attr('class', 'overlay');
  }

  function appendTextToRelationship(r) {
    return r.append('text')
      .attr('class', 'text')
      .attr('fill', d => edgeColors(d.type).color)
      .attr('font-size', '12px')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .text((d) => d.type);
  }

  function appendRelationshipToGraph() {
    const svgRelationship = appendRelationship();

    const text = appendTextToRelationship(svgRelationship);

    const outline = appendOutlineToRelationship(svgRelationship);
    const overlay = appendOverlayToRelationship(svgRelationship);

    return {
      outline,
      overlay,
      relationship: svgRelationship,
      text,
    };
  }

  function updateNodes(n: INode) {
    Array.prototype.push.apply(nodes, n);

    node = svgNodes.selectAll('.node')
    .data(nodes, (d: INode) => d.id);

    const nodeEnter = appendNodeToGraph();
    node = nodeEnter.merge(node);
  }

  function updateRelationships(r: IRelationship) {
    Array.prototype.push.apply(relationships, r);

      let a = svgRelationships.selectAll('.relationship')
      relationship = svgRelationships.selectAll('.relationship')
          .data(relationships, (d: IRelationship) => d.id) as d3.Selection<SVGGElement, IRelationship, SVGGElement, any>;

    const relationshipEnter = appendRelationshipToGraph();

    relationship = relationshipEnter.relationship.merge(relationship);
    relationshipOutline = svg.selectAll('.relationship .outline');
    relationshipOutline = relationshipEnter.outline.merge(relationshipOutline);

    relationshipOverlay = svg.selectAll('.relationship .overlay');
    relationshipOverlay = relationshipEnter.overlay.merge(relationshipOverlay);

    relationshipText = svg.selectAll('.relationship .text');
    relationshipText = relationshipEnter.text.merge(relationshipText);
  }

  function updateNodesAndRelationships(n, r) {

    var nodeIds = nodes.map(n => n.id)
    n = n.filter(k => !nodeIds.includes(k.id))

    var edgeIds = relationships.map(e => e.id)
    r = r.filter(k => !edgeIds.includes(k.id))

    updateRelationships(r);
    updateNodes(n);

    simulation.nodes(nodes);
    simulation.force('link', d3.forceLink(relationships).id((d: IRelationship) => d.id))

  }

  function graphDataToD3Data(data) {
    const graph = {
      nodes: [],
      relationships: [],
    };

    data.results.forEach((result) => {
      result.data.forEach((dataItem) => {
        dataItem.graph.nodes.forEach((nodeData) => {
          if (!contains(graph.nodes, nodeData.id)) {
            const randomColor = nodeData.labels?.length === 0 ? 'gray' : color();

            graph.nodes.push({
              ...nodeData,
              color: options.nodeOutlineFillColor ? options.nodeOutlineFillColor : randomColor,
            });
          }
        });

        dataItem.graph.relationships.forEach((relationshipData) => {
          graph.relationships.push({
            ...relationshipData,
            source: relationshipData.startNode,
            target: relationshipData.endNode,
          });
        });

        dataItem.graph.relationships.sort((a, b) => {
          if (a.source > b.source) {
            return 1;
          }

          if (a.source < b.source) {
            return -1;
          }

          if (a.target > b.target) {
            return 1;
          }

          if (a.target < b.target) {
            return -1;
          }

          return 0;
        });
      });
    });

    return graph;
  }

  function updateWithD3Data(d3Data) {
    // marker
    updateNodesAndRelationships(d3Data.nodes, d3Data.relationships);
  }

  function updateWithGraphData(graphData) {
    const d3Data = graphDataToD3Data(graphData);
    updateWithD3Data(d3Data);
  }

  function loadGraphData(graphData) {
    nodes = [];
    relationships = [];

    updateWithGraphData(graphData);
  }

  function rotatePoint(c, p, angle) {
    return Utils.rotate(c.x, c.y, p.x, p.y, angle);
  }

  function rotation(source, target) {
    return (Math.atan2(target.y - source.y, target.x - source.x) * 180) / Math.PI;
  }

  function size() {
    return {
      nodes: nodes.length,
      relationships: relationships.length,
    };
  }

  function unitaryNormalVector(source, target, newLength) {
    const center = { x: 0, y: 0 };
    const vector = Utils.unitaryVector(source, target, newLength);

    return rotatePoint(center, vector, 90);
  }

  function tickRelationshipsOutlines() {
    relationship.each(function relationshipNode() {
      const rel = d3.select(this);
      const outline = rel.select('.outline');
      const textNode = rel.select('.text');
      const textBoundingBox = (textNode.node() as SVGSVGElement).getBBox();

      outline.attr('d', (d: any) => {
        const center = { x: 0, y: 0 };
        const angle = rotation(d.source, d.target);
        const textPadding = 0;
        const u = Utils.unitaryVector(d.source, d.target, 1);
        const textMargin = {
          x: (d.target.x - d.source.x - (textBoundingBox.width + textPadding) * u.x) * 0.5,
          y: (d.target.y - d.source.y - (textBoundingBox.width + textPadding) * u.y) * 0.5,
        };
        const n = unitaryNormalVector(d.source, d.target, 1);
        const rotatedPointA1 = rotatePoint(center, {
          x: 0 + (options.nodeRadius + 1) * u.x - n.x,
          y: 0 + (options.nodeRadius + 1) * u.y - n.y,
        }, angle);
        const rotatedPointB1 = rotatePoint(center, { x: textMargin.x - n.x, y: textMargin.y - n.y }, angle);
        const rotatedPointC1 = rotatePoint(center, { x: textMargin.x, y: textMargin.y }, angle);
        const rotatedPointD1 = rotatePoint(center, {
          x: 0 + (options.nodeRadius + 1) * u.x,
          y: 0 + (options.nodeRadius + 1) * u.y,
        }, angle);
        const rotatedPointA2 = rotatePoint(center, {
          x: d.target.x - d.source.x - textMargin.x - n.x,
          y: d.target.y - d.source.y - textMargin.y - n.y,
        }, angle);
        const rotatedPointB2 = rotatePoint(center, {
          x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x - n.x - u.x * options.arrowSize,
          y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y - n.y - u.y * options.arrowSize,
        }, angle);
        const rotatedPointC2 = rotatePoint(center, {
          x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x - n.x + (n.x - u.x) * options.arrowSize,
          y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y - n.y + (n.y - u.y) * options.arrowSize,
        }, angle);
        const rotatedPointD2 = rotatePoint(center, {
          x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x,
          y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y,
        }, angle);
        const rotatedPointE2 = rotatePoint(center, {
          x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x + (-n.x - u.x) * options.arrowSize,
          y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y + (-n.y - u.y) * options.arrowSize,
        }, angle);
        const rotatedPointF2 = rotatePoint(center, {
          x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x - u.x * options.arrowSize,
          y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y - u.y * options.arrowSize,
        }, angle);
        const rotatedPointG2 = rotatePoint(center, {
          x: d.target.x - d.source.x - textMargin.x,
          y: d.target.y - d.source.y - textMargin.y,
        }, angle);

        return `M ${rotatedPointA1.x} ${rotatedPointA1.y}
          L ${rotatedPointB1.x} ${rotatedPointB1.y}
          L ${rotatedPointC1.x} ${rotatedPointC1.y}
          L ${rotatedPointD1.x} ${rotatedPointD1.y}
          Z M ${rotatedPointA2.x} ${rotatedPointA2.y}
          L ${rotatedPointB2.x} ${rotatedPointB2.y}
          L ${rotatedPointC2.x} ${rotatedPointC2.y}
          L ${rotatedPointD2.x} ${rotatedPointD2.y}
          L ${rotatedPointE2.x} ${rotatedPointE2.y}
          L ${rotatedPointF2.x} ${rotatedPointF2.y}
          L ${rotatedPointG2.x} ${rotatedPointG2.y}
          Z`;
      });
    });
  }

  function tickRelationshipsOverlays() {
    relationshipOverlay.attr('d', (d) => {
      const center = { x: 0, y: 0 };
      const angle = rotation(d.source, d.target);
      const n1 = unitaryNormalVector(d.source, d.target, 1);
      const n = unitaryNormalVector(d.source, d.target, 50);
      const rotatedPointA = rotatePoint(center, { x: 0 - n.x, y: 0 - n.y }, angle);
      const rotatedPointB = rotatePoint(center, {
        x: d.target.x - d.source.x - n.x,
        y: d.target.y - d.source.y - n.y,
      }, angle);
      const rotatedPointC = rotatePoint(center, {
        x: d.target.x - d.source.x + n.x - n1.x,
        y: d.target.y - d.source.y + n.y - n1.y,
      }, angle);
      const rotatedPointD = rotatePoint(center, { x: 0 + n.x - n1.x, y: 0 + n.y - n1.y }, angle);

      return `M ${rotatedPointA.x} ${rotatedPointA.y}
        L ${rotatedPointB.x} ${rotatedPointB.y}
        L ${rotatedPointC.x} ${rotatedPointC.y}
        L ${rotatedPointD.x} ${rotatedPointD.y}
        Z`;
    });
  }

  function tickRelationshipsTexts() {
    relationshipText.attr('transform', (d) => {
      const angle = (rotation(d.source, d.target) + 360) % 360;
      const mirror = angle > 90 && angle < 270;
      const center = { x: 0, y: 0 };
      const n = unitaryNormalVector(d.source, d.target, 1);
      const nWeight = mirror ? 2 : -3;
      const point = {
        x: (d.target.x - d.source.x) * 0.5 + n.x * nWeight,
        y: (d.target.y - d.source.y) * 0.5 + n.y * nWeight,
      };
      const rotatedPoint = rotatePoint(center, point, angle);

      return `translate(${rotatedPoint.x}, ${rotatedPoint.y}) rotate(${mirror ? 180 : 0})`;
    });
  }

  function tickRelationships() {
    if (relationship) {
      relationship.attr('transform', (d: IRelationship) => {
        const angle = rotation(d.source, d.target);
        return `translate(${d.source.x} , ${d.source.y}) rotate(${angle})`;
      });

      tickRelationshipsTexts();
      tickRelationshipsOutlines();
      tickRelationshipsOverlays();
    }
  }

  function tickNodes() {
    if (node) {
      node.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
    }
  }

  function tick() {
    
    simulation.tick(1)
    tickNodes();
    tickRelationships();
  }

  // eslint-disable-next-line no-unused-vars
  function zoomFit() {
    const bounds = svg.node().getBBox();
    const parent = svg.node().parentElement.parentElement;

    if (!parent) {
      return;
    }

    const fullWidth = parent.clientWidth;
    const fullHeight = parent.clientHeight;
    const { width, height } = bounds;
    const midX = bounds.x + width / 2;
    const midY = bounds.y + height / 2;

    if (width === 0 || height === 0) {
      return; // nothing to fit
    }

    svgScale = 0.85 / Math.max(width / fullWidth, height / fullHeight);
    svgTranslate = [fullWidth / 2 - svgScale * midX, fullHeight / 2 - svgScale * midY];

    svg.attr('transform', `translate(${svgTranslate[0]}, ${svgTranslate[1]}) scale(${svgScale})`);
  }

  function initSimulation() {
    const spreadFactor = 1.25;
    return d3.forceSimulation()
    // .force('x', d3.forceCollide().strength(0.002))
    // .force('y', d3.forceCollide().strength(0.002))
    // .force('y', d3.force().strength(0.002))
    .velocityDecay(0.4)
    .force('collide', d3.forceCollide().radius(() => options.minCollision * spreadFactor).iterations(10))
    .force('charge', d3.forceManyBody().strength(-400))
    .force('link', d3.forceLink().id((d: IRelationship) => d.id))
    .force('center', d3.forceCenter(svg.node().parentElement.parentElement.clientWidth / 2,
                                    svg.node().parentElement.parentElement.clientHeight / 2))
    .force('centerX', d3.forceX(0).strength(0.03))
    .force('centerX', d3.forceX(0).strength(0.03))
    .on('tick', () => {
      tick();
    })
    .on('end', () => {
      if (options.zoomFit && !justLoaded) {
        justLoaded = true;
        zoomFit();
      }
    });
  }

  function init() {
    if (!options.minCollision) {
      options.minCollision = options.nodeRadius * 2;
    }

    selector = _selector;

    const container = d3.select(selector);

    container.attr('class', 'graphd3')
      .html('');

    if (options.infoPanel) {
      info = appendInfoPanel(container);
    }

    appendGraph(container);

    simulation = initSimulation();

    if (options.graphData) {
      loadGraphData(options.graphData);
    } else {
      console.error('Error: graphData is empty!');
    }
  }

  init();

  return {
    graphDataToD3Data,
    size,
    updateWithD3Data,
    updateWithGraphData,
    version,
    invertColor: Utils.invertColor,
    darkenColor: Utils.darkenColor,
    zoomFuncs,
  };
}

export default GraphD3;
