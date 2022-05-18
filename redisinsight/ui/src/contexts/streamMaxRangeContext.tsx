import { createContext } from 'react'

interface Props {
  maxVal?: number;
  setMaxVal: (value?: number) => void;
}

const StreamMaxRangeContext = createContext<Props>(undefined!)

export default StreamMaxRangeContext
