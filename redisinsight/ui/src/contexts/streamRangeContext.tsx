import { createContext } from 'react'

type ContextProps = {
  range: number[],
  setRange: (_value: number[]) => void
}

const StreamRangeContext = createContext<ContextProps>([[], () => {}])

export default StreamRangeContext
