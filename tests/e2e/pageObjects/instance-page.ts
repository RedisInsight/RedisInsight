import { BasePage } from './base-page';
import { Profiler, Cli, CommandHelper } from './components/bottom-panel';
import { OverviewPanel } from './components/overview-panel';
import { ExplorePanel } from './components/explore-panel';
export class InstancePage extends BasePage {
    Profiler = new Profiler();
    Cli = new Cli();
    CommandHelper = new CommandHelper();
    OverviewPanel = new OverviewPanel();
    ExplorePanel = new ExplorePanel();
}
