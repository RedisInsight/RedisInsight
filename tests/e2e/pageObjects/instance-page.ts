import { BasePage } from './base-page';
import { Profiler, Cli, CommandHelper } from './components/instance';

export class InstancePage extends BasePage {
    Profiler = new Profiler();
    Cli = new Cli();
    CommandHelper = new CommandHelper();
}
