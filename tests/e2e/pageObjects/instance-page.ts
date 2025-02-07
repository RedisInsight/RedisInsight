import { BasePage } from './base-page';
import { Profiler, Cli, CommandHelper, SurveyLink } from './components/bottom-panel';
import { OverviewPanel } from './components/overview-panel';
import { InsightsPanel } from './components/insights-panel';
import { MonacoEditor } from './components/monaco-editor';
import { NavigationHeader } from './components/navigation/navigation-header';
import { DatabaseOverview } from './components/top-panel';
export class InstancePage extends BasePage {
    Profiler = new Profiler();
    Cli = new Cli();
    CommandHelper = new CommandHelper();
    DatabaseOverview = new DatabaseOverview();
    SurveyLink = new SurveyLink();
    OverviewPanel = new OverviewPanel();
    InsightsPanel = new InsightsPanel();
    MonacoEditor = new MonacoEditor();
    NavigationHeader = new NavigationHeader();
}
