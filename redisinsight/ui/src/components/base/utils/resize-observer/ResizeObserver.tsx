import React, { useEffect, useRef } from 'react'

interface ResizeObserverProps {
  children: (ref: React.Ref<HTMLDivElement>) => React.ReactNode
  onResize: (dimensions: { height: number; width: number }) => void
}

export const ResizeObserver: React.FC<ResizeObserverProps> = ({
  children,
  onResize,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const observer = new window.ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      onResize({ width, height })
    })

    observer.observe(element)

    // eslint-disable-next-line consistent-return
    return () => {
      observer.disconnect()
    }
  }, [onResize])

  return <>{children(containerRef)}</>
}

export default ResizeObserver
