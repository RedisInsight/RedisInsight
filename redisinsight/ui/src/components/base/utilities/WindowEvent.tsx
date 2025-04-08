import { useEffect } from 'react'

type EventNames = keyof WindowEventMap

interface WindowEventProps<Ev extends EventNames> {
  event: Ev
  handler: (ev: WindowEventMap[Ev]) => any
}

export function WindowEvent<E extends EventNames>({
  event,
  handler,
}: WindowEventProps<E>) {
  useEffect(() => {
    window.addEventListener(event, handler)
    return () => {
      window.removeEventListener(event, handler)
    }
  }, [event, handler])
  return null
}
