import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { Location } from 'history'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { Pages } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'

export const useUndeployedChangesPrompt = () => {
  const { changes } = useSelector(rdiPipelineSelector)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [nextLocation, setNextLocation] = useState<Nullable<Location<unknown>>>(null)
  const [shouldBlockLeaving, setShouldBlockLeaving] = useState<boolean>(false)

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const history = useHistory()

  useEffect(() => {
    setShouldBlockLeaving(!!Object.keys(changes).length)
  }, [changes])

  useEffect(() => {
    // @ts-ignore
    const unlistenBlockChecker = history.block((location: Location<unknown>) => {
      if (shouldBlockLeaving && !location?.pathname.startsWith(Pages.rdiPipeline(rdiInstanceId))) {
        setNextLocation(location)
        setShowModal(true)
        return false
      }
      return true
    })

    return () => {
      unlistenBlockChecker()
    }
  }, [shouldBlockLeaving])

  const handleCloseModal = () => {
    setShowModal(false)
    setNextLocation(null)
  }

  const handleConfirmLeave = () => {
    setShowModal(false)
    setShouldBlockLeaving(false)
  }

  useEffect(() => {
    if (!shouldBlockLeaving && nextLocation) {
      history.push(nextLocation.pathname)
    }
  }, [shouldBlockLeaving, nextLocation, history])

  return {
    showModal,
    handleCloseModal,
    handleConfirmLeave
  }
}
