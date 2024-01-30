import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { EuiIcon, EuiSpacer } from '@elastic/eui'
import { isString, partialRight } from 'lodash'
import { keysDataSelector } from 'uiSrc/slices/browser/keys'
import { openCli, openCliHelper, resetCliHelperSettings, resetCliSettings } from 'uiSrc/slices/cli/cli-settings'
import { setMonitorInitialState, showMonitor } from 'uiSrc/slices/cli/monitor'
import { Pages } from 'uiSrc/constants/pages'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { dbAnalysisSelector, setDatabaseAnalysisViewTab } from 'uiSrc/slices/analytics/dbAnalysis'
import { incrementOnboardStepAction, setOnboardNextStep, setOnboardPrevStep } from 'uiSrc/slices/app/features'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { DatabaseAnalysisViewTab } from 'uiSrc/slices/interfaces/analytics'
import OnboardingEmoji from 'uiSrc/assets/img/onboarding-emoji.svg'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { OnboardingStepName, OnboardingSteps } from 'uiSrc/constants/onboarding'

import { fetchRedisearchListAction } from 'uiSrc/slices/browser/redisearch'
import { bufferToString, Nullable } from 'uiSrc/utils'
import { CodeBlock } from 'uiSrc/components'

import { changeSelectedTab, toggleInsightsPanel } from 'uiSrc/slices/panels/insights'
import { InsightsPanelTabs } from 'uiSrc/slices/interfaces/insights'
import styles from './styles.module.scss'

const sendTelemetry = (databaseId: string, step: string, action: string) => sendEventTelemetry({
  event: TelemetryEvent.ONBOARDING_TOUR_CLICKED,
  eventData: {
    databaseId,
    step,
    action
  }
})

type TelemetryArgs = [string, OnboardingStepName]

const sendBackTelemetryEvent = partialRight(sendTelemetry, 'back')
const sendNextTelemetryEvent = partialRight(sendTelemetry, 'next')
const sendClosedTelemetryEvent = partialRight(sendTelemetry, 'closed')

const ONBOARDING_FEATURES = {
  BROWSER_PAGE: {
    step: OnboardingSteps.BrowserPage,
    title: 'Browser',
    Inner: () => {
      const { id: connectedInstanceId = '' } = useSelector(connectedInstanceSelector)
      const { total } = useSelector(keysDataSelector)
      const telemetryArgs: TelemetryArgs = [
        connectedInstanceId,
        total ? OnboardingStepName.BrowserWithKeys : OnboardingStepName.BrowserWithoutKeys
      ]

      return {
        content: total
          ? 'This is Browser, where you can see the list of keys, filter them, perform bulk operations, and view the values.'
          : (
            <>
              This is Browser, where you can see the list of keys in the plain List or Tree view,
              filter them, perform bulk operations, and view the values.
              <EuiSpacer size="xs" />
              Add a key to your database using a dedicated form.
            </>
          ),
        onSkip: () => sendClosedTelemetryEvent(...telemetryArgs),
        onNext: () => sendNextTelemetryEvent(...telemetryArgs)
      }
    }
  },
  BROWSER_TREE_VIEW: {
    step: OnboardingSteps.BrowserTreeView,
    title: 'Tree view',
    Inner: () => {
      const { id: connectedInstanceId = '' } = useSelector(connectedInstanceSelector)
      const telemetryArgs: TelemetryArgs = [connectedInstanceId, OnboardingStepName.BrowserTreeView]

      return {
        content: 'Switch from List to Tree view to see keys grouped into folders based on their namespaces.',
        onSkip: () => sendClosedTelemetryEvent(...telemetryArgs),
        onBack: () => sendBackTelemetryEvent(...telemetryArgs),
        onNext: () => sendNextTelemetryEvent(...telemetryArgs),
      }
    }
  },
  BROWSER_FILTER_SEARCH: {
    step: OnboardingSteps.BrowserFilterSearch,
    title: 'Filter and search',
    Inner: () => {
      const { id: connectedInstanceId = '' } = useSelector(connectedInstanceSelector)
      const dispatch = useDispatch()
      const telemetryArgs: TelemetryArgs = [connectedInstanceId, OnboardingStepName.BrowserFilters]

      return {
        content: 'Choose between filtering your data based on key name or pattern. Or perform full-text search across all your data.',
        onSkip: () => sendClosedTelemetryEvent(...telemetryArgs),
        onBack: () => sendBackTelemetryEvent(...telemetryArgs),
        onNext: () => {
          dispatch(openCli())
          sendNextTelemetryEvent(...telemetryArgs)
        }
      }
    }
  },
  BROWSER_CLI: {
    step: OnboardingSteps.BrowserCLI,
    title: 'CLI',
    Inner: () => {
      const { id: connectedInstanceId = '' } = useSelector(connectedInstanceSelector)
      const dispatch = useDispatch()
      const telemetryArgs: TelemetryArgs = [connectedInstanceId, OnboardingStepName.BrowserCLI]

      return {
        content: 'Use CLI to run Redis commands.',
        onSkip: () => sendClosedTelemetryEvent(...telemetryArgs),
        onBack: () => sendBackTelemetryEvent(...telemetryArgs),
        onNext: () => {
          dispatch(openCliHelper())
          sendNextTelemetryEvent(...telemetryArgs)
        }
      }
    }
  },
  BROWSER_COMMAND_HELPER: {
    step: OnboardingSteps.BrowserCommandHelper,
    title: 'Command Helper',
    Inner: () => {
      const { id: connectedInstanceId = '' } = useSelector(connectedInstanceSelector)
      const dispatch = useDispatch()
      const telemetryArgs: TelemetryArgs = [connectedInstanceId, OnboardingStepName.BrowserCommandHelper]

      return {
        content: (
          <>
            Command Helper lets you search and learn more about Redis commands, their syntax, and details.
            <EuiSpacer size="xs" />
            Run <b>PING</b> in CLI to see how it works.
          </>
        ),
        onSkip: () => sendClosedTelemetryEvent(...telemetryArgs),
        onBack: () => {
          dispatch(openCli())
          sendBackTelemetryEvent(...telemetryArgs)
        },
        onNext: () => {
          dispatch(showMonitor())
          sendNextTelemetryEvent(...telemetryArgs)
        }
      }
    }
  },
  BROWSER_PROFILER: {
    step: OnboardingSteps.BrowserProfiler,
    title: 'Profiler',
    Inner: () => {
      const { id: connectedInstanceId = '' } = useSelector(connectedInstanceSelector)

      const dispatch = useDispatch()
      const history = useHistory()
      const telemetryArgs: TelemetryArgs = [connectedInstanceId, OnboardingStepName.BrowserProfiler]

      return {
        content: (
          <>
            Use Profiler to track commands sent against the Redis server in real-time.
            <EuiSpacer size="xs" />
            Select <b>Start Profiler</b> to stream back every command processed by the Redis server.
            Save the log to download and investigate commands.
            <EuiSpacer size="xs" />
            <i>Tip: Remember to stop Profiler to avoid throughput decrease.</i>
          </>
        ),
        onSkip: () => sendClosedTelemetryEvent(...telemetryArgs),
        onBack: () => {
          dispatch(openCliHelper())
          sendBackTelemetryEvent(...telemetryArgs)
        },
        onNext: () => {
          dispatch(resetCliSettings())
          dispatch(resetCliHelperSettings())
          dispatch(setMonitorInitialState())

          history.push(Pages.workbench(connectedInstanceId))
          sendNextTelemetryEvent(...telemetryArgs)
        }
      }
    }
  },
  WORKBENCH_PAGE: {
    step: OnboardingSteps.WorkbenchPage,
    title: 'Try Workbench!',
    Inner: () => {
      const { id: connectedInstanceId = '' } = useSelector(connectedInstanceSelector)
      const [firstIndex, setFirstIndex] = useState<Nullable<string>>(null)

      const dispatch = useDispatch()
      const history = useHistory()
      const telemetryArgs: TelemetryArgs = [connectedInstanceId, OnboardingStepName.WorkbenchIntro]

      useEffect(() => {
        dispatch(fetchRedisearchListAction(
          (indexes) => {
            setFirstIndex(indexes?.length ? bufferToString(indexes[0]) : '')
          },
          () => setFirstIndex(''),
          false
        ))
      }, [])

      return {
        content: (
          <>
            This is Workbench, our advanced CLI for Redis commands.
            <EuiSpacer size="xs" />
            Take advantage of syntax highlighting, intelligent auto-complete, and working with commands in editor mode.
            <EuiSpacer size="xs" />
            Workbench visualizes complex <a href="https://redis.io/docs/about/about-stack/" target="_blank" rel="noreferrer">Redis Stack</a> data
            models such as documents, graphs, and time series.
            Or you <a href="https://github.com/RedisInsight/Packages" target="_blank" rel="noreferrer">can build your own visualization</a>.

            {isString(firstIndex) && (
              <>
                <EuiSpacer size="s" />
                {firstIndex ? (
                  <>
                    Run this command to see information and statistics on your index:
                    <EuiSpacer size="xs" />
                    <CodeBlock
                      isCopyable
                      className={styles.pre}
                      data-testid="wb-onboarding-command"
                    >
                      FT.INFO {firstIndex}
                    </CodeBlock>
                  </>
                ) : (
                  <>
                    Run this command to see information and statistics about client connections:
                    <EuiSpacer size="xs" />
                    <CodeBlock
                      isCopyable
                      className={styles.pre}
                      data-testid="wb-onboarding-command"
                    >
                      CLIENT LIST
                    </CodeBlock>
                  </>
                )}
              </>
            )}
          </>
        ),
        onSkip: () => sendClosedTelemetryEvent(...telemetryArgs),
        onBack: () => {
          history.push(Pages.browser(connectedInstanceId))
          dispatch(showMonitor())
          sendBackTelemetryEvent(...telemetryArgs)
        },
        onNext: () => {
          dispatch(changeSelectedTab(InsightsPanelTabs.Explore))
          dispatch(toggleInsightsPanel(true))
          sendNextTelemetryEvent(...telemetryArgs)
        },
      }
    }
  },
  EXPLORE_REDIS: {
    step: OnboardingSteps.Tutorials,
    title: 'Explore and learn more',
    Inner: () => {
      const { id: connectedInstanceId = '' } = useSelector(connectedInstanceSelector)
      const telemetryArgs: TelemetryArgs = [connectedInstanceId, OnboardingStepName.ExploreTutorials]

      const history = useHistory()
      const dispatch = useDispatch()

      return {
        content: 'Learn more about how Redis can solve your use cases using interactive Tutorials.',
        onSkip: () => sendClosedTelemetryEvent(...telemetryArgs),
        onBack: () => {
          history.push(Pages.workbench(connectedInstanceId))
          dispatch(toggleInsightsPanel(false))
          sendBackTelemetryEvent(...telemetryArgs)
        },
        onNext: () => sendNextTelemetryEvent(...telemetryArgs)
      }
    }
  },
  EXPLORE_CUSTOM_TUTORIALS: {
    step: OnboardingSteps.CustomTutorials,
    title: 'Upload your tutorials',
    Inner: () => {
      const { id: connectedInstanceId = '' } = useSelector(connectedInstanceSelector)
      const history = useHistory()
      const dispatch = useDispatch()
      const telemetryArgs: TelemetryArgs = [connectedInstanceId, OnboardingStepName.ExploreCustomTutorials]

      return {
        content: (
          <>
            Share your Redis expertise with your team and the wider community by building custom RedisInsight tutorials.
            <EuiSpacer size="xs" />
            Use our <a href="https://github.com/RedisInsight/Tutorials" target="_blank" rel="noreferrer">instructions</a> to
            describe your implementations of Redis for other users to follow and
            interact with in the context of a connected Redis database
          </>
        ),
        onSkip: () => sendClosedTelemetryEvent(...telemetryArgs),
        onBack: () => sendBackTelemetryEvent(...telemetryArgs),
        onNext: () => {
          dispatch(toggleInsightsPanel(false))
          history.push(Pages.clusterDetails(connectedInstanceId))
          sendNextTelemetryEvent(...telemetryArgs)
        }
      }
    }
  },
  ANALYTICS_OVERVIEW: {
    step: OnboardingSteps.AnalyticsOverview,
    title: 'Cluster Overview',
    Inner: () => {
      const { id: connectedInstanceId = '' } = useSelector(connectedInstanceSelector)
      const history = useHistory()
      const dispatch = useDispatch()
      const telemetryArgs: TelemetryArgs = [connectedInstanceId, OnboardingStepName.ClusterOverview]

      return {
        content: (
          <>
            Investigate memory and key allocation in your cluster database and monitor database
            information per primary nodes.
          </>
        ),
        onSkip: () => sendClosedTelemetryEvent(...telemetryArgs),
        onBack: () => {
          dispatch(changeSelectedTab(InsightsPanelTabs.Explore))
          dispatch(toggleInsightsPanel(true))
          history.push(Pages.workbench(connectedInstanceId))
          sendBackTelemetryEvent(...telemetryArgs)
        },
        onNext: () => {
          history.push(Pages.databaseAnalysis(connectedInstanceId))
          sendNextTelemetryEvent(...telemetryArgs)
        }
      }
    }
  },
  ANALYTICS_DATABASE_ANALYSIS: {
    step: OnboardingSteps.AnalyticsDatabaseAnalysis,
    title: 'Database Analysis',
    Inner: () => {
      const { data } = useSelector(dbAnalysisSelector)
      const { id: connectedInstanceId = '', connectionType } = useSelector(connectedInstanceSelector)
      const dispatch = useDispatch()
      const history = useHistory()
      const telemetryArgs: TelemetryArgs = [connectedInstanceId, OnboardingStepName.DatabaseAnalysisOverview]

      return {
        content: (
          <>
            Use Database Analysis to get summary of your database and receive
            tips to improve memory usage and performance.
            <EuiSpacer size="xs" />
            Run a new report to get an overview of the database and receive
            tips to optimize your database usage.
          </>
        ),
        onSkip: () => sendClosedTelemetryEvent(...telemetryArgs),
        onBack: () => {
          if (connectionType !== ConnectionType.Cluster) {
            dispatch(changeSelectedTab(InsightsPanelTabs.Explore))
            dispatch(toggleInsightsPanel(true))
            dispatch(setOnboardPrevStep())
            history.push(Pages.workbench(connectedInstanceId))
          }
          sendBackTelemetryEvent(...telemetryArgs)
        },
        onNext: () => {
          if (!data?.recommendations?.length) {
            dispatch(setOnboardNextStep())
            history.push(Pages.slowLog(connectedInstanceId))
          } else {
            dispatch(setDatabaseAnalysisViewTab(DatabaseAnalysisViewTab.Recommendations))
          }

          sendNextTelemetryEvent(...telemetryArgs)
        }
      }
    }
  },
  ANALYTICS_RECOMMENDATIONS: {
    step: OnboardingSteps.AnalyticsRecommendations,
    title: 'Database Tips',
    Inner: () => {
      const { id: connectedInstanceId = '' } = useSelector(connectedInstanceSelector)
      const history = useHistory()
      const telemetryArgs: TelemetryArgs = [connectedInstanceId, OnboardingStepName.DatabaseAnalysisRecommendations]

      return {
        content: 'See tips to optimize the memory usage, performance and increase the security of your Redis database',
        onSkip: () => sendClosedTelemetryEvent(...telemetryArgs),
        onBack: () => sendBackTelemetryEvent(...telemetryArgs),
        onNext: () => {
          history.push(Pages.slowLog(connectedInstanceId))
          sendNextTelemetryEvent(...telemetryArgs)
        }
      }
    }
  },
  ANALYTICS_SLOW_LOG: {
    step: OnboardingSteps.AnalyticsSlowLog,
    title: 'Slow Log',
    Inner: () => {
      const { id: connectedInstanceId = '' } = useSelector(connectedInstanceSelector)
      const { data } = useSelector(dbAnalysisSelector)
      const history = useHistory()
      const dispatch = useDispatch()
      const telemetryArgs: TelemetryArgs = [connectedInstanceId, OnboardingStepName.SlowLog]

      return {
        content: (
          <>
            Check Slow Log to troubleshoot performance issues.
            <EuiSpacer size="xs" />
            See the list of slow logs in chronological order to debug and trace your Redis database.
            Customize parameters to capture  logs.
          </>
        ),
        onSkip: () => sendClosedTelemetryEvent(...telemetryArgs),
        onBack: () => {
          history.push(Pages.databaseAnalysis(connectedInstanceId))

          if (!data?.recommendations?.length) {
            dispatch(setOnboardPrevStep())
          } else {
            dispatch(setDatabaseAnalysisViewTab(DatabaseAnalysisViewTab.Recommendations))
          }
          sendBackTelemetryEvent(...telemetryArgs)
        },
        onNext: () => {
          history.push(Pages.pubSub(connectedInstanceId))
          sendNextTelemetryEvent(...telemetryArgs)
        }
      }
    }
  },
  PUB_SUB_PAGE: {
    step: OnboardingSteps.PubSubPage,
    title: 'Pub/Sub',
    Inner: () => {
      const { id: connectedInstanceId = '' } = useSelector(connectedInstanceSelector)
      const history = useHistory()
      const telemetryArgs: TelemetryArgs = [connectedInstanceId, OnboardingStepName.PubSub]

      return {
        content: (
          <>
            Use Redis pub/sub to subscribe to channels and post messages to channels.
            <EuiSpacer size="xs" />
            Subscribe to receive messages from all channels or enter a message to post to a specified channel.
          </>
        ),
        onSkip: () => sendClosedTelemetryEvent(...telemetryArgs),
        onBack: () => {
          history.push(Pages.slowLog(connectedInstanceId))
          sendBackTelemetryEvent(...telemetryArgs)
        },
        onNext: () => {
          history.push(Pages.triggeredFunctions(connectedInstanceId))
          sendNextTelemetryEvent(...telemetryArgs)
        }
      }
    }
  },
  TRIGGERED_FUNCTIONS_PAGE: {
    step: OnboardingSteps.TriggeredFunctionsPage,
    title: 'Triggers and Functions',
    Inner: () => {
      const { id: connectedInstanceId = '' } = useSelector(connectedInstanceSelector)
      const history = useHistory()
      const telemetryArgs: TelemetryArgs = [connectedInstanceId, OnboardingStepName.TriggeredFunctions]

      return {
        content: (
          <>
            Triggers and Functions can execute server-side functions triggered by certain
            events or data operations to decrease latency and react in real time to database events.
            <EuiSpacer size="xs" />
            See the list of uploaded libraries, upload or delete libraries, or investigate and debug functions.
          </>
        ),
        onSkip: () => sendClosedTelemetryEvent(...telemetryArgs),
        onBack: () => {
          history.push(Pages.pubSub(connectedInstanceId))
          sendBackTelemetryEvent(...telemetryArgs)
        },
        onNext: () => sendNextTelemetryEvent(...telemetryArgs)
      }
    }
  },
  FINISH: {
    step: OnboardingSteps.Finish,
    title: (
      <>
        Great job!
        <EuiIcon style={{ marginLeft: 4, marginTop: -4 }} type={OnboardingEmoji} />
      </>
    ),
    Inner: () => {
      const { id: connectedInstanceId = '' } = useSelector(connectedInstanceSelector)
      const history = useHistory()
      const dispatch = useDispatch()
      const telemetryArgs: TelemetryArgs = [connectedInstanceId, OnboardingStepName.Finish]

      useEffect(() => {
        const closeLastStep = async () => {
          await dispatch(incrementOnboardStepAction(
            OnboardingSteps.Finish,
            0,
            async () => {
              await sendEventTelemetry({
                event: TelemetryEvent.ONBOARDING_TOUR_FINISHED,
                eventData: {
                  databaseId: connectedInstanceId
                }
              })
            }
          ))
        }

        window.addEventListener('beforeunload', closeLastStep)
        return () => {
          window.removeEventListener('beforeunload', closeLastStep)
        }
      }, [connectedInstanceId])

      return {
        content: (
          <>
            You are done!
            <EuiSpacer size="xs" />
            Take me back to Browser.
          </>
        ),
        onSkip: () => {
          sendClosedTelemetryEvent(...telemetryArgs)
          sendEventTelemetry({
            event: TelemetryEvent.ONBOARDING_TOUR_FINISHED,
            eventData: {
              databaseId: connectedInstanceId
            }
          })
        },
        onBack: () => sendBackTelemetryEvent(...telemetryArgs),
        onNext: () => {
          history.push(Pages.browser(connectedInstanceId))
          sendNextTelemetryEvent(...telemetryArgs)
          sendEventTelemetry({
            event: TelemetryEvent.ONBOARDING_TOUR_FINISHED,
            eventData: {
              databaseId: connectedInstanceId
            }
          })
        },
      }
    }
  },
}

export {
  ONBOARDING_FEATURES
}
