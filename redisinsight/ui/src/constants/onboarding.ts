enum OnboardingSteps {
  Start,
  BrowserPage,
  BrowserTreeView,
  BrowserFilterSearch,
  BrowserCLI,
  BrowserCommandHelper,
  BrowserProfiler,
  // BrowserInsights,
  WorkbenchPage,
  Tutorials,
  CustomTutorials,
  AnalyticsOverview,
  AnalyticsDatabaseAnalysis,
  AnalyticsRecommendations,
  AnalyticsSlowLog,
  PubSubPage,
  TriggeredFunctionsPage,
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
  BrowserInsights = 'browser_insights',
  WorkbenchIntro = 'workbench_intro',
  ExploreTutorials = 'insights_explore_tutorials',
  ExploreCustomTutorials = 'insights_explore_custom_tutorials',
  ClusterOverview = 'cluster_overview',
  DatabaseAnalysisOverview = 'database_analysis_overview',
  DatabaseAnalysisRecommendations = 'database_analysis_recommendations',
  SlowLog = 'slow_log',
  PubSub = 'pub_sub',
  TriggeredFunctions = 'triggers_and_functions',
  Finish = 'finish',
}

export {
  OnboardingSteps,
  OnboardingStepName,
}
