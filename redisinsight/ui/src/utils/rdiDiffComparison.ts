import { store } from 'uiSrc/slices/store'
import {
  disableConfigDiff,
  disableJobDiff,
  enableConfigDiff,
  enableJobDiff,
  rdiPipelineSelector,
  setDesiredPipeline,
} from 'uiSrc/slices/rdi/pipeline'
import { Maybe } from 'uiSrc/utils'
import { IRdiPipelineJob } from 'uiSrc/slices/interfaces'

export interface RdiDiffOptions {
  enableAutoComparison?: boolean
  fallbackValue?: string
  triggerVisualDiff?: boolean
}

export interface RdiDiffResult {
  shouldShowDiff: boolean
  originalValue: string | undefined
  hasChanges: boolean
}

/**
 * Utility function for automatic RDI text comparison between current and slice values
 * This compares current editor content against the slice baseline values (same as AI assistant uses)
 *
 * @param currentValue - The current text value from the editor
 * @param type - Type of comparison: 'config' for pipeline config, 'job' for specific job
 * @param jobName - Required when type is 'job', the name of the job to compare
 * @param options - Additional options for comparison behavior
 * @returns Comparison result with diff information
 */
export const compareRdiText = (
  currentValue: string,
  type: 'config' | 'job',
  jobName?: string,
  options: RdiDiffOptions = {},
): RdiDiffResult => {
  const {
    enableAutoComparison = true,
    fallbackValue = '',
    triggerVisualDiff = true,
  } = options

  if (!enableAutoComparison) {
    return {
      shouldShowDiff: false,
      originalValue: undefined,
      hasChanges: false,
    }
  }

  // Get current state from the RDI slice
  const state = store.getState()
  const pipelineData = rdiPipelineSelector(state)

  let sliceValue: Maybe<string>

  if (type === 'config') {
    // For config, compare against the slice config (same as AI assistant uses)
    sliceValue = pipelineData.config || undefined
  } else if (type === 'job' && jobName) {
    // For jobs, find the specific job in the slice jobs array (same as AI assistant uses)
    const sliceJobs = pipelineData.jobs || []
    const sliceJob = Array.isArray(sliceJobs)
      ? sliceJobs.find((job: any) => job.name === jobName)
      : null
    sliceValue = sliceJob?.value || undefined
  }

  // Use slice value as original, fallback to provided fallback
  const originalValue = sliceValue || fallbackValue || undefined

  // Determine if we should show diff (only if we have both values and they're different)
  const shouldShowDiff = Boolean(
    originalValue && currentValue !== originalValue,
  )

  const hasChanges = currentValue !== (sliceValue || '')

  // 🚀 TRIGGER VISUAL DIFF IN MONACO EDITORS
  if (triggerVisualDiff && originalValue) {
    if (shouldShowDiff) {
      // Enable diff mode with the comparison
      if (type === 'config') {
        store.dispatch(
          enableConfigDiff({
            originalValue,
            newValue: currentValue,
          }),
        )
      } else if (type === 'job' && jobName) {
        store.dispatch(
          enableJobDiff({
            jobName,
            originalValue,
            newValue: currentValue,
          }),
        )
      }
    } else if (type === 'config') {
      // Disable diff mode if values are the same
      store.dispatch(disableConfigDiff())
    } else if (type === 'job' && jobName) {
      store.dispatch(disableJobDiff({ jobName }))
    }
  }

  return {
    shouldShowDiff,
    originalValue,
    hasChanges,
  }
}

/**
 * Convenience function specifically for config comparison
 * Compares current config against the slice config baseline
 * TRIGGERS VISUAL DIFF in Monaco editor automatically!
 */
export const compareRdiConfig = (
  currentConfig: string,
  options?: RdiDiffOptions,
): RdiDiffResult => compareRdiText(currentConfig, 'config', undefined, options)

/**
 * Convenience function specifically for job comparison
 * Compares current job against the slice job baseline
 * TRIGGERS VISUAL DIFF in Monaco editor automatically!
 */
export const compareRdiJob = (
  currentJobValue: string,
  jobName: string,
  options?: RdiDiffOptions,
): RdiDiffResult => compareRdiText(currentJobValue, 'job', jobName, options)

export const isNotDiffEmpty = (value: any) => value !== '' && value !== '\u200B'

export const isConfigDiff = () => {
  const state = store.getState()
  const { config, desiredPipeline } = rdiPipelineSelector(state)

  return (
    desiredPipeline.active &&
    config !== desiredPipeline.config &&
    isNotDiffEmpty(desiredPipeline.config)
  )
}

export const isJobDiff = (jobName: string) => {
  const state = store.getState()
  const { jobs, desiredPipeline } = rdiPipelineSelector(state)

  if (!desiredPipeline.active) return false

  const currentJob = jobs.find((job: any) => job.name === jobName)
  const desiredJob = desiredPipeline.jobs.find(
    (job: any) => job.name === jobName,
  )

  return (
    desiredJob &&
    currentJob?.value !== desiredJob.value &&
    isNotDiffEmpty(desiredJob.value)
  )
}
//
// export const isDiff = () => {
//   const state = store.getState()
//   const { config, jobs, desiredPipeline } = rdiPipelineSelector(state)
//
//   if (JSON.stringify(config) === JSON.stringify(desiredPipeline.config)) {
//     return true
//   }
//
//   return
// }

export const setPipeline = (pipeline: {
  config: string
  jobs: IRdiPipelineJob[]
}) => {
  store.dispatch(setDesiredPipeline(pipeline))
  // return (dispatch: AppDispatch) => {
  //   dispatch(setDesiredPipeline(pipeline))
  // }
}
// Expose to window object for testing
declare global {
  interface Window {
    RdiDiffComparison?: {
      compareRdiText: typeof compareRdiText
      compareRdiConfig: typeof compareRdiConfig
      compareRdiJob: typeof compareRdiJob
      setPipeline: typeof setPipeline
    }
  }
}

// Initialize window object exposure
if (typeof window !== 'undefined') {
  ;(window as any).RdiDiffComparison = {
    compareRdiText,
    compareRdiConfig,
    compareRdiJob,
    setPipeline,
  }
}
