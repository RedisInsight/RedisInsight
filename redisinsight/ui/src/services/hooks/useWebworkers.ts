import { useEffect, useState, useRef } from 'react'
import { Nullable } from 'uiSrc/utils'

const workerHandler = (fn: (...args: any) => any) => {
  onmessage = (event) => {
    postMessage(fn(event.data))
  }
}

export const useWebworker = (fn: (...args: any) => any) => {
  const [result, setResult] = useState<Nullable<any>>(null)
  const [error, setError] = useState<Nullable<ErrorEvent>>(null)

  const workerRef = useRef<Nullable<Worker>>(null)

  useEffect(() => {
    const worker = new Worker(
      URL.createObjectURL(new Blob([`(${workerHandler})(${fn})`]))
    )
    workerRef.current = worker
    worker.onmessage = (event) => setResult(event.data)
    worker.onerror = (error: ErrorEvent) => setError(error)
    return () => {
      worker.terminate()
    }
  }, [fn])

  return {
    result,
    error,
    run: (value:any) => workerRef.current?.postMessage(value),
  }
}

export const useDisposableWebworker = (fn: (...args: any) => any) => {
  const [result, setResult] = useState<Nullable<any>>(null)
  const [error, setError] = useState<Nullable<ErrorEvent>>(null)

  const run = (value: any) => {
    const worker = new Worker(
      URL.createObjectURL(new Blob([`(${workerHandler})(${fn})`]))
    )
    worker.onmessage = (event) => {
      setResult(event.data)
      worker.terminate()
    }
    worker.onerror = (error: ErrorEvent) => {
      setError(error)
      worker.terminate()
    }
    worker.postMessage(value)
  }

  return {
    result,
    error,
    run,
  }
}
