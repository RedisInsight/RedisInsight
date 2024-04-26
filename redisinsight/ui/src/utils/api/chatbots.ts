import { CustomHeaders } from 'uiSrc/constants/api'
import { isStatusSuccessful } from 'uiSrc/utils'

export const getStreamedAnswer = async (
  url: string,
  message: string,
  { onMessage, onFinish, onError }: {
    onMessage?: (message: string) => void,
    onFinish?: () => void
    onError?: (error: unknown) => void
  }
) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        [CustomHeaders.WindowId]: window.windowId || '',
      },
      body: JSON.stringify({ content: message })
    })

    const reader = response.body!.pipeThrough(new TextDecoderStream()).getReader()
    if (!isStatusSuccessful(response.status)) {
      throw new Error(response.statusText)
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
  } catch (error: unknown) {
    onError?.(error)
  }
}
