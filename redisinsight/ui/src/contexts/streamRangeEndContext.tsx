import { createContext } from 'react'

interface IStreamRangeEndContext {
  endVal?: number
  setEndVal: (value?: number) => void
}

const StreamRangeEndContext = createContext<IStreamRangeEndContext>(undefined!)

export default StreamRangeEndContext
