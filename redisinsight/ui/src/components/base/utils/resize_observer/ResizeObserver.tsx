import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react'

interface ResizeObserverProps {
  children: (ref: (e: HTMLElement | null) => void) => ReactNode
  onResize: (dimensions: { height: number; width: number }) => void
}

const hasResizeObserver =
  typeof window !== 'undefined' && typeof window.ResizeObserver !== 'undefined'

export const ResizeObserver = ({ children, onResize }: ResizeObserverProps) => {
  const ref = useRef<HTMLElement | null>(null)
  const observerRef = useRef<ResizeObserver | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const handleResize = useCallback(() => {
    const node = ref.current
    if (!node) return
    const { width, height } = node.getBoundingClientRect()
    if (width !== dimensions.width || height !== dimensions.height) {
      onResize({ width, height })
      setDimensions({ width, height })
    }
  }, [onResize, dimensions])

  const updateRef = useCallback(
    (node: HTMLElement | null) => {
      if (ref.current === node) return

      // Disconnect previous observer
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }

      ref.current = node

      if (node && hasResizeObserver) {
        observerRef.current = new window.ResizeObserver(handleResize)
        observerRef.current.observe(node)
      }
    },
    [handleResize],
  )

  useEffect(
    () => () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    },
    [],
  )

  return <>{children(updateRef)}</>
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

export const useResizeObserver = (
  container: Element | null,
  dimension?: 'width' | 'height',
) => {
  const [size, _setSize] = useState({ width: 0, height: 0 })

  // _currentDimensions and _setSize are used to only store the
  // new state (and trigger a re-render) when the new dimensions actually differ
  const _currentDimensions = useRef(size)
  const setSize = useCallback(
    (dimensions: { width: number; height: number }) => {
      const doesWidthMatter = dimension !== 'height'
      const doesHeightMatter = dimension !== 'width'
      if (
        (doesWidthMatter &&
          _currentDimensions.current.width !== dimensions.width) ||
        (doesHeightMatter &&
          _currentDimensions.current.height !== dimensions.height)
      ) {
        _currentDimensions.current = dimensions
        _setSize(dimensions)
      }
    },
    [dimension],
  )

  useEffect(() => {
    if (container != null) {
      const observer = makeResizeObserver(container, ([entry]) => {
        const { inlineSize, blockSize } = entry.borderBoxSize[0]
        setSize({
          width: inlineSize,
          height: blockSize,
        })
      })

      return () => observer && observer.disconnect()
    }
    setSize({ width: 0, height: 0 })
  }, [container, setSize])

  return size
}