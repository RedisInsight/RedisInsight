import { createContext } from 'react'

interface IStreamRangeStartContext {
  startVal?: number;
  setStartVal: (value?: number) => void;
}

const StreamRangeStartContext = createContext<IStreamRangeStartContext>(undefined!)

export default StreamRangeStartContext
