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


function charCodeSum(str: string) {
  let sum = 0
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i)
  }
  return sum
}

export function invertColor(hex: string) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    // invert color components
    var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    // pad each with zeros and return
    return '#' + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str) {
    let len = str.length || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}

export const NODE_COLORS_DARK = [
    { color: '#6A1DC3', borderColor: '#6A1DC3', textColor: '#FFFFFF' },
    { color: '#364CFF', borderColor: '#364CFF', textColor: '#FFFFFF' },
    { color: '#008556', borderColor: '#008556', textColor: '#FFFFFF' },
    { color: '#333D4F', borderColor: '#333D4F', textColor: '#FFFFFF' },
    { color: '#9C5C2B', borderColor: '#9C5C2B', textColor: '#FFFFFF' },
    { color: '#A00A6B', borderColor: '#A00A6B', textColor: '#FFFFFF' },
    { color: '#6F7C07', borderColor: '#6F7C07', textColor: '#FFFFFF' },
    { color: '#14708D', borderColor: '#14708D', textColor: '#FFFFFF' },
    { color: '#AA4E4E', borderColor: '#AA4E4E', textColor: '#FFFFFF' },
    { color: '#6E6E6E', borderColor: '#6E6E6E', textColor: '#FFFFFF' },
]

export const EDGE_COLORS_DARK = [
    { color: '#C7C7C7', borderColor: '#C7C7C7', textColor: '#FFFFFF' },
    { color: '#E3AAAA', borderColor: '#E3AAAA', textColor: '#FFFFFF' },
    { color: '#ACCCD7', borderColor: '#ACCCD7', textColor: '#FFFFFF' },
    { color: '#C7CEA8', borderColor: '#C7CEA8', textColor: '#FFFFFF' },
    { color: '#D9A0C6', borderColor: '#D9A0C6', textColor: '#FFFFFF' },
    { color: '#D4BAA7', borderColor: '#D4BAA7', textColor: '#FFFFFF' },
    { color: '#B8C5DB', borderColor: '#B8C5DB', textColor: '#FFFFFF' },
    { color: '#A5D4C3', borderColor: '#A5D4C3', textColor: '#FFFFFF' },
    { color: '#CDDDF8', borderColor: '#CDDDF8', textColor: '#FFFFFF' },
    { color: '#C7B0EA', borderColor: '#C7B0EA', textColor: '#FFFFFF' },
]


export const NODE_COLORS = [
    { color: '#C7B0EA', borderColor: '#C7B0EA', textColor: '#000000' },
    { color: '#CDDDF8', borderColor: '#CDDDF8', textColor: '#000000' },
    { color: '#A5D4C3', borderColor: '#A5D4C3', textColor: '#000000' },
    { color: '#B8C5DB', borderColor: '#B8C5DB', textColor: '#000000' },
    { color: '#D4BAA7', borderColor: '#D4BAA7', textColor: '#000000' },
    { color: '#D9A0C6', borderColor: '#D9A0C6', textColor: '#000000' },
    { color: '#C7CEA8', borderColor: '#C7CEA8', textColor: '#000000' },
    { color: '#ACCCD7', borderColor: '#ACCCD7', textColor: '#000000' },
    { color: '#E3AAAA', borderColor: '#E3AAAA', textColor: '#000000' },
    { color: '#C7C7C7', borderColor: '#C7C7C7', textColor: '#000000' },
]

export const EDGE_COLORS = [
    { color: '#6E6E6E', borderColor: '#6E6E6E', textColor: '#000000' },
    { color: '#A85050', borderColor: '#A85050', textColor: '#000000' },
    { color: '#1D6F8A', borderColor: '#1D6F8A', textColor: '#000000' },
    { color: '#6F7B23', borderColor: '#6F7B23', textColor: '#000000' },
    { color: '#9E1669', borderColor: '#9E1669', textColor: '#000000' },
    { color: '#9A5D34', borderColor: '#9A5D34', textColor: '#000000' },
    { color: '#363F4F', borderColor: '#363F4F', textColor: '#000000' },
    { color: '#0F8459', borderColor: '#0F8459', textColor: '#000000' },
    { color: '#384EF9', borderColor: '#384EF9', textColor: '#000000' },
    { color: '#6924BD', borderColor: '#6924BD', textColor: '#000000' },
]

interface IColor {
    color: string
    textColor: string
    borderColor: string
}

export interface IGoodColor extends IColor {}

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
