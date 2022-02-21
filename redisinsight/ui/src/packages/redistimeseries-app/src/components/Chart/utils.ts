export const WATERMARK_OPTIONS = {
    image: '',
    paddingRight: 25,
    paddingBottom: 25,
    opacity: .7,
    imageToWatermarkSizeRatio: 0.1,
}


/**
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * format: `data:[<mediatype>][;base64],<data>`
 * eg: `data:image/png,atuon9MOLNKIUu`
 */
type DataURI = string

const SVG_MIME_TYPE = 'image/svg+xml'
const SVG_URI_SCHEME = `data:${SVG_MIME_TYPE},`

interface IImageDimension {
    height: number
    width: number
}

function calculateAspectRatioFit(srcWidth: number, srcHeight: number, maxWidth: number, maxHeight: number) {
  var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
  return { width: srcWidth * ratio, height: srcHeight * ratio };
}

export function addWatermarkToImageDataURI(image: DataURI, watermarkOpts = WATERMARK_OPTIONS): Promise<DataURI> {
  if (image.startsWith(SVG_URI_SCHEME)) {
    return addWatermarkToSVGDataURI(image, watermarkOpts)
  }

  return new Promise(resolve => {
    createOffscreenCanvasForImage(image).then(canvas => {
      createOffscreenCanvasForImage(watermarkOpts.image).then(watermarkCanvas => {
        const ctx = canvas.getContext('2d')!

        const { width: watermarkWidth, height: watermarkHeight } = calculateAspectRatioFit(
          watermarkCanvas.width,
          watermarkCanvas.height,
          canvas.width * watermarkOpts.imageToWatermarkSizeRatio,
          canvas.height * watermarkOpts.imageToWatermarkSizeRatio,
        )

        ctx.save()
        ctx.globalAlpha = watermarkOpts.opacity

        ctx.drawImage(
          watermarkCanvas,
          canvas.width - watermarkOpts.paddingRight - watermarkWidth,
          canvas.height - watermarkOpts.paddingBottom - watermarkHeight,
          watermarkWidth,
          watermarkHeight,
        )

        ctx.restore()
        const img = canvas.toDataURL(getMimeTypeOfDataURI(image))
        resolve(img)
        document.body.removeChild(canvas)
      })
    })
  })
}

export function getDataURIFromSVGStr(svgStr: string) {
  return SVG_URI_SCHEME + encodeURIComponent(svgStr)
}

function addWatermarkToSVGDataURI(image: DataURI, watermarkOpts = WATERMARK_OPTIONS): Promise<DataURI> {
  const svg = getSVGDocumentFromDataURI(image)
  const svgElement = svg.documentElement

  const imgHeight = parseInt(svgElement.getAttribute('height')!)
  const imgWidth = parseInt(svgElement.getAttribute('width')!)

  return new Promise<DataURI>(resolve =>
    createOffscreenCanvasForImage(watermarkOpts.image).then(watermarkCanvas => {
      const { width: watermarkWidth, height: watermarkHeight } = calculateAspectRatioFit(
        watermarkCanvas.width,
        watermarkCanvas.height,
        imgWidth * watermarkOpts.imageToWatermarkSizeRatio,
        imgHeight * watermarkOpts.imageToWatermarkSizeRatio,
      )

      addImgToSVG(
        svg,
        watermarkOpts.image,
        imgWidth - watermarkOpts.paddingRight - watermarkWidth,
        imgHeight - watermarkOpts.paddingBottom - watermarkHeight,
        watermarkHeight,
        watermarkWidth,
        watermarkOpts.opacity,
      )
      resolve(getDataURIFromSVGDocument(svg))
      document.body.removeChild(watermarkCanvas)
    })
  )
}



function addImgToSVG(svg: Document, src: string, x: number, y: number, height: number, width: number, opacity = 1) {
  const svgElement = svg.documentElement

  const image = svg.createElementNS(svgElement.getAttribute('xmlns'), 'image')
  image.setAttribute('xlink:href', src)
  image.setAttribute('x', x.toString())
  image.setAttribute('y', y.toString())
  image.setAttribute('height', height.toString())
  image.setAttribute('width', width.toString())
  image.setAttribute('opacity', opacity.toString())

  svg.firstChild!.appendChild(image)
}

function addTextToSVG(svg: Document, text: string, x: number, y: number, opacity = 1, style = '') {
  const svgElement = svg.documentElement

  const imgHeight = parseInt(svgElement.getAttribute('height')!)
  const imgWidth = parseInt(svgElement.getAttribute('width')!)

  const textEl = svg.createElementNS(svgElement.getAttribute('xmlns'), 'text')
  textEl.innerHTML = text
  textEl.setAttribute('x', (imgWidth + x).toString())
  textEl.setAttribute('y', (imgHeight - y).toString())
  textEl.setAttribute('fill-opacity', opacity.toString())
  textEl.setAttribute('style', style)

  svg.firstChild!.appendChild(textEl)
}

function createOffscreenCanvasForImage(image: DataURI): Promise<HTMLCanvasElement> {
  const canvas = createOffscreenCanvas()
  const ctx = canvas.getContext('2d')!
  const img = new Image()

  // https://stackoverflow.com/questions/22710627/tainted-canvases-may-not-be-exported/45129760#45129760
  img.setAttribute('crossOrigin', 'anonymous')

  return new Promise(resolve => {
    img.addEventListener('load', function() {
      canvas.height = img.height
      canvas.width = img.width
      ctx.drawImage(img, 0, 0)
      resolve(canvas)
    })
    img.setAttribute('src', image)
  })
}

function createOffscreenCanvas() {
  const canvas = document.createElement('canvas')
  canvas.style.position = 'absolute'
  canvas.style.left = '-5000px'
  document.body.appendChild(canvas)
  return canvas
}

function getDataURIFromSVGDocument(svg: Document) {
  return getDataURIFromSVGStr(new XMLSerializer().serializeToString(svg))
}

function getSVGDocumentFromDataURI(svgDataURI: DataURI) {
  const svgStr = decodeURIComponent(svgDataURI.substr(SVG_URI_SCHEME.length))
  return new DOMParser().parseFromString(svgStr, SVG_MIME_TYPE)
}

function getMimeTypeOfDataURI(uri: DataURI) {
    return uri.split(/[:;,]/g)[1]
}



function charCodeSum(str: string) {
  let sum = 0
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i)
  }
  return sum
}

export const COLORS = [
  { color: '#054657', borderColor: '#033644', textColor: 'white' },
  { color: '#2F9BA5', borderColor: '#268790', textColor: 'white' },
  { color: '#D7E0D0', borderColor: '#BBC4B4', textColor: 'black' },
  { color: '#EFA613', borderColor: '#D5920C', textColor: 'black' },
  { color: '#FC7508', borderColor: '#BD5705', textColor: 'black' },
  { color: '#0D8076', borderColor: '#0B6F67', textColor: 'white' },
  { color: '#19242F', borderColor: '#111921', textColor: 'white' },
  { color: '#CCCC52', borderColor: '#B6B649', textColor: 'black' },
  { color: '#C49A68', borderColor: '#A38055', textColor: 'black' },
  { color: '#746C6A', borderColor: '#5E5755', textColor: 'white' }
]


interface IColor {
    color: string
}

interface IGoodColor extends IColor {
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
  constructor() {
    super(COLORS);
  }
}

