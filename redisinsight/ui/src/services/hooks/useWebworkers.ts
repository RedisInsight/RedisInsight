import { useEffect, useState, useRef } from 'react'
import { Nullable } from 'uiSrc/utils'

const workerHandler = (fn: (...args: any) => any) => {
  onmessage = (event) => {
    postMessage(fn(event.data))
  }
}

export const useWebworker = (fn: (...args: any) => any) => {
  const [result, setResult] = useState<Nullable<any>>(null)
  const [error, setError] = useState<string>('')

  const workerRef = useRef<Nullable<Worker>>(null)

  useEffect(() => {
    const worker = new Worker(
      URL.createObjectURL(new Blob([`(${workerHandler})(${fn})`]))
    )
    workerRef.current = worker
    worker.onmessage = (event) => setResult(event.data)
    worker.onerror = (error) => setError(error.message)
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
  const [error, setError] = useState<string>('')

  const run = (value: any) => {
    const worker = new Worker(
      URL.createObjectURL(new Blob([`(${workerHandler})(${fn})`]))
    )
    worker.onmessage = (event) => {
      setResult(event.data)
      worker.terminate()
    }
    worker.onerror = (error) => {
      setError(error.message)
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
