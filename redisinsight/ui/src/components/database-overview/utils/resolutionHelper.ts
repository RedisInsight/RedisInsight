import { find, min } from 'lodash'
import { IMetric } from 'uiSrc/components/database-overview/components/OverviewMetrics/OverviewMetrics'

interface ILimits {
  width: number; // resolution
  metrics: number; // max overview metrics to show
  modules: number; // max overview modules to show
}

const CONFIG = {
  maxModules: 6,
  overviewMultiFactor: 2,
  resolutionLimits: [
    {
      width: 1300,
      metrics: 5,
      modules: 6,
    },
    {
      width: 1124,
      metrics: 5,
      modules: 3,
    },
    {
      width: 920,
      metrics: 5,
      modules: 0,
    },
    {
      width: -1,
      metrics: 3,
      modules: 0,
    },
  ],
}

export const getResolutionLimits = (innerWidth: number, metrics: Array<IMetric>): ILimits => {
  const limits = find(CONFIG.resolutionLimits, ({ width }) => innerWidth > width)
    || CONFIG.resolutionLimits[CONFIG.resolutionLimits.length - 1]

  const spaceNotUsedByOverview = (limits.metrics - metrics.length) * CONFIG.overviewMultiFactor

  if (spaceNotUsedByOverview > 0) {
    return {
      ...limits,
      modules: min([spaceNotUsedByOverview + limits.modules, CONFIG.maxModules]) || 0
    }
  }

  return limits
}
