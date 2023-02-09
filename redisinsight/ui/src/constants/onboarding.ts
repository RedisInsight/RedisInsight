enum OnboardingSteps {
  Start,
  BrowserPage,
  BrowserTreeView,
  BrowserFilterSearch,
  BrowserCLI,
  BrowserCommandHelper,
  BrowserProfiler,
  WorkbenchPage,
  WorkbenchEnablementGuide,
  AnalyticsOverview,
  AnalyticsDatabaseAnalysis,
  AnalyticsRecommendations,
  AnalyticsSlowLog,
  PubSubPage,
  Finish
}

enum OnboardingStepName {
  Start = 'start',
  BrowserWithKeys = 'browser_with_keys',
  BrowserWithoutKeys = 'browser_without_keys',
  BrowserTreeView = 'browser_tree_view',
  BrowserFilters = 'browser_filters',
  BrowserCLI = 'browser_cli',
  BrowserCommandHelper = 'browser_command_helper',
  BrowserProfiler = 'browser_profiler',
  WorkbenchIntro = 'workbench_intro',
  WorkbenchGuides = 'workbench_guides',
  ClusterOverview = 'cluster_overview',
  DatabaseAnalysisOverview = 'database_analysis_overview',
  DatabaseAnalysisRecommendations = 'database_analysis_recommendations',
  SlowLog = 'slow_log',
  PubSub = 'pub_sub',
  Finish = 'finish',
}

export {
  OnboardingSteps,
  OnboardingStepName,
}
