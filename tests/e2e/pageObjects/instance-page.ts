import { BasePage } from './base-page';
import { Profiler, Cli, CommandHelper } from './components/instance';
import { OverviewPanel } from './components/overview-panel';
export class InstancePage extends BasePage {
    Profiler = new Profiler();
    Cli = new Cli();
    CommandHelper = new CommandHelper();
    OverviewPanel = new OverviewPanel();
}
