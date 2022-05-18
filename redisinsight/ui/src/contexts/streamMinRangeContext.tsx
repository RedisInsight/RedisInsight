import { createContext } from 'react'

interface Props {
  minVal?: number;
  setMinVal: (value?: number) => void;
}

const StreamMinRangeContext = createContext<Props>(undefined!)

export default StreamMinRangeContext
