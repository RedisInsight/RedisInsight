import { ReactNode } from 'react'
import { BaseObserver } from '../observer'

interface ResizeObserverProps {
  children: (ref: (e: HTMLElement | null) => void) => ReactNode
  onResize: (dimensions: { height: number; width: number }) => void
}

const hasResizeObserver =
  typeof window !== 'undefined' && typeof window.ResizeObserver !== 'undefined'
export class ResizeObserver extends BaseObserver<ResizeObserverProps> {
  name = 'ResizeObserver'

  state = {
    height: 0,
    width: 0,
  }

  onResize: ResizeObserverCallback = () => {
    if (!this.childNode) return
    const { height, width } = this.childNode.getBoundingClientRect()
    // Check for actual resize event
    if (this.state.height === height && this.state.width === width) {
      return
    }

    this.props.onResize({
      height,
      width,
    })
    this.setState({ height, width })
  }

  beginObserve = () => {
    // The superclass checks that childNode is not null before invoking
    // beginObserve()
    const childNode = this.childNode!
    this.observer = makeResizeObserver(childNode, this.onResize)!
  }
}

const makeResizeObserver = (
  node: Element,
  callback: ResizeObserverCallback,
) => {
  let observer
  if (hasResizeObserver) {
    observer = new window.ResizeObserver(callback)
    observer.observe(node)
  }
  return observer
}
