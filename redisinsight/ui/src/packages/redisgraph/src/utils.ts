import * as d3 from 'd3'
import { responseParser } from './parser'
import { EDGE_STROKE } from './constants'

export function pulse(node: d3.Selection<SVGElement, any, any, any>) {
    var times = 0;
  (function repeat() {
    node
    .transition()
    .duration(100)
    .attr("data-pulse", "true")
    .attr("stroke", "purple")
    .attr("stroke-width", 0)
    .attr('stroke-opacity', 0)
    .transition()
    .duration(500)
    .attr("stroke-width", 0)
    .attr('stroke-opacity', 0.5)
    .transition()
    .duration(1000)
    .attr("stroke-width", 65)
    .attr('stroke-opacity', 0)
    .ease(d3.easeCubicInOut)
    .on("end", () => {
      if (times === 3) {
        node.transition().attr("data-pulse", "")
        return;
      }
      times++;
      repeat()
    });
  })()
}
export const toString = (d) => {
  let s = d.labels ? d.labels[0] : d.type;

  s += ` (<id>:  ${d.id}`;

  Object.keys(d.properties).forEach((property) => {
    s += `, ${property} : ${JSON.stringify(d.properties[property])}`;
  });

  s += ')';

  return s;
};

export const truncateText = (str = '', length = 100) => {
  const ending = '...';

  if (str.length > length) {
    return str.substring(0, length - ending.length) + ending;
  }

  return str;
};

export const rotate = (cx, cy, x, y, angle) => {
  const radians = (Math.PI / 180) * angle;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;
  const ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;

  return { x: nx, y: ny };
};

export const unitaryVector = (source, target, newLength) => {
  const length = Math.sqrt((target.x - source.x) ** 2
    + (target.y - source.y) ** 2) / Math.sqrt(newLength || 1);

  return {
    x: (target.x - source.x) / length,
    y: (target.y - source.y) / length,
  };
};

export const darkenColor = (color) => d3.rgb(color).darker(1);

export const invertColor = (hexColor) => {
  let color = hexColor;

  if (hexColor.indexOf('#') === 0) {
    color = hexColor.slice(1);
  }

  if (color.length === 3) {
    color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
  }

  if (color.length !== 6) {
    throw new Error('Invalid HEX color');
  }

  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);

  return (r * 0.299 + g * 0.587 + b * 0.114) > 186
    ? '#000000'
    : '#FFFFFF';
};

function charCodeSum(str: string) {
  let sum = 0
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i)
  }
  return sum
}


export const NODE_COLORS = [
  { color: '#C5AFE7', borderColor: '#C5AFE7', textColor: 'black' },
  { color: '#CCDCF6', borderColor: '#CCDCF6', textColor: 'black' },
  { color: '#A4D3C2', borderColor: '#A4D3C2', textColor: 'black' },
  { color: '#B7C4D9', borderColor: '#B7C4D9', textColor: 'black' },
  { color: '#D3B9A7', borderColor: '#D3B9A7', textColor: 'black' },
  { color: '#D79FC3', borderColor: '#D79FC3', textColor: 'black' },
  { color: '#C6CDA9', borderColor: '#C6CDA9', textColor: 'black' },
  { color: '#ABCBD5', borderColor: '#ABCBD5', textColor: 'black' },
  { color: '#E2A9A9', borderColor: '#E2A9A9', textColor: 'black' },
  { color: '#C6C6C6', borderColor: '#C6C6C6', textColor: 'black' },
]

export const EDGE_COLORS = [
  { color: '#6E6E6E', borderColor: '#6E6E6E', textColor: '#6E6E6E' },
  { color: '#A85050', borderColor: '#A85050', textColor: '#A85050' },
  { color: '#1D6F8A', borderColor: '#1D6F8A', textColor: '#1D6F8A' },
  { color: '#6F7B23', borderColor: '#6F7B23', textColor: '#6F7B23' },
  { color: '#9E1669', borderColor: '#9E1669', textColor: '#9E1669' },
  { color: '#9A5D34', borderColor: '#9A5D34', textColor: '#9A5D34' },
  { color: '#363F4F', borderColor: '#363F4F', textColor: '#363F4F' },
  { color: '#0F8459', borderColor: '#0F8459', textColor: '#0F8459' },
  { color: '#384EF9', borderColor: '#384EF9', textColor: '#384EF9' },
  { color: '#6924BD', borderColor: '#6924BD', textColor: '#6924BD' },
]


interface IColor {
    color: string
}

export interface IGoodColor extends IColor {
    borderColor: string
    textColor: string
}

/*
 * ColorPicker: Get colors based on `label`.
 */
export class ColorPicker<T extends IColor> {

    // All the default colors are stored here.
    private readonly colors: T[]

    // store all the colors that are not taken by any label at a certain window.
    private currentColorStore: T[]

    // cache for label and its chosen color.
    private labelStore: { [keyName: string]: T }

  constructor(colors: T[]) {
    this.colors = [...colors]
    this.currentColorStore = [...colors]
    this.labelStore = {}
  }

  /*
   * Get a color object of type `T` based on `label`.
   */
  getColor(label: string) {
    // if the label has been seen previously, return the stored color.
    if (this.labelStore[label] !== undefined) {
      return this.labelStore[label]
    }

    // if the current color store is empty, i.e., all the colors has
    // been taken, so reset the color store to default color set.
    if (this.currentColorStore.length === 0) {
      this.currentColorStore = [...this.colors]
    }
    // get the color by hashing the label.
    const goodColor = this.currentColorStore[charCodeSum(label) % this.currentColorStore.length]

    // since the color has been taken by `label`, remove it from the current color store.
    this.currentColorStore = this.currentColorStore.filter(color => color !== goodColor);

    // cache the label and color key value pair.
    this.labelStore[label] = goodColor
    return goodColor;
  }
}

/*
 * GoodColorPicker: ColorPicker but only good colors.
 */
export class GoodColorPicker extends ColorPicker<IGoodColor> {
  constructor(COLORS: IGoodColor[]) {
    super(COLORS);
  }
}
