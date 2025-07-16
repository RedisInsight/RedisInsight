import { CustomHeaders } from 'uiSrc/constants/api'
import { isStatusSuccessful } from 'uiSrc/utils'
import ApiStatusCode from '../../constants/apiStatusCode'

const TIMEOUT_FOR_MESSAGE_REQUEST = 30_000

export const getStreamedAnswer = async (
  url: string,
  message: string,
  {
    onMessage,
    onFinish,
    onError,
    isRdiStream = false,
    pipelineContext,
    timeout,
  }: {
    onMessage?: (message: string) => void
    onFinish?: () => void
    onError?: (error: unknown) => void
    isRdiStream?: boolean
    pipelineContext?: {
      config?: string
      jobs?: string
    }
    timeout?: number
  },
) => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, timeout || TIMEOUT_FOR_MESSAGE_REQUEST)

    const body: {
      content: string
      type?: string
      rdiContext?: string
      pipelineConfig?: string
      pipelineJobs?: string
    } = { content: message }

    if (isRdiStream) {
      body.type = 'rdi_stream'
    }

    // Add pipeline context if provided
    if (pipelineContext) {
      body.rdiContext = JSON.stringify(pipelineContext)
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        [CustomHeaders.WindowId]: window.windowId || '',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const reader = response
      .body!.pipeThrough(new TextDecoderStream())
      .getReader()
    if (!isStatusSuccessful(response.status)) {
      const { value } = await reader.read()

      const errorResponse = value ? JSON.parse(value) : {}
      const extendedResponseError = {
        errorCode: errorResponse.errorCode ?? '',
        details: errorResponse.details ?? {},
      }
      const error = Object.assign(response, extendedResponseError)
      onError?.(error)
      return
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const { value, done } = await reader!.read()
      if (done) {
        onFinish?.()
        break
      }
      onMessage?.(value)
    }
  } catch (error: any) {
    onError?.(
      error?.name === 'AbortError'
        ? { status: ApiStatusCode.Timeout, statusText: 'ERRTIMEOUT' }
        : error,
    )
  }
}
