import { BasePage } from './base-page';
import { Profiler, Cli, CommandHelper } from './components/bottom-panel';
import { OverviewPanel } from './components/overview-panel';
import { InsightsPanel } from './components/insights-panel';
export class InstancePage extends BasePage {
    Profiler = new Profiler();
    Cli = new Cli();
    CommandHelper = new CommandHelper();
    OverviewPanel = new OverviewPanel();
    InsightsPanel = new InsightsPanel();
}
