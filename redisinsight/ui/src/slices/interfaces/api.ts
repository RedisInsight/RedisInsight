import {
  CreateCommandExecutionDto as CreateCommandExecutionDtoAPI,
  CommandExecution as CommandExecutionAPI,
  CommandExecutionResult as CommandExecutionResultAPI,
} from 'uiSrc/api-client'

interface CreateCommandExecutionDto extends CreateCommandExecutionDtoAPI {}
interface CommandExecution extends CommandExecutionAPI {}
interface CommandExecutionResult extends CommandExecutionResultAPI {}

export { CommandExecution, CommandExecutionResult, CreateCommandExecutionDto }
