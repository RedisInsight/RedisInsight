import { EuiTableFieldDataColumnType } from '@elastic/eui'
import { find } from 'lodash'
import { Instance } from 'uiSrc/slices/interfaces'

const MIN_COLUMN_WIDTH = 180
const getColumnWidth = (width?: string) => (width && /^[0-9]+px/.test(width) ? parseInt(width, 10) : MIN_COLUMN_WIDTH)
const hideColumn = (column: EuiTableFieldDataColumnType<Instance>) => ({
  ...column,
  width: '0px',
  className: 'hiddenColumn',
})
const findColumn = (columns: EuiTableFieldDataColumnType<Instance>[], colName: string) =>
  find(columns, ({ field }) => field === colName)

export {
  MIN_COLUMN_WIDTH,
  getColumnWidth,
  hideColumn,
  findColumn,
}
