import { MutableRefObject, useRef } from 'react'

export function useLatest<Value>(value: Value): MutableRefObject<Value | null> {
  const latestValueRef = useRef(value)
  latestValueRef.current = value
  return latestValueRef
}
