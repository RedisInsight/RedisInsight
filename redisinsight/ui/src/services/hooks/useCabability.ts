import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setCapability } from 'uiSrc/slices/app/context'

export const useCapabilty = (source = '') => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setCapability({ source, tutorialPopoverShown: false }))
  }, [source])
}
