import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import { EuiInMemoryTable, } from '@elastic/eui';
var noResultMessage = 'No results';
var TableView = React.memo(function (_a) {
    var result = _a.result, query = _a.query;
    var _b = useState([]), columns = _b[0], setColumns = _b[1];
    useEffect(function () {
        if (!(result === null || result === void 0 ? void 0 : result.length)) {
            return;
        }
        var newColumns = Object.keys(result[0]).map(function (item) { return ({
            field: item,
            name: item,
            truncateText: true,
        }); });
        setColumns(newColumns);
    }, [result, query]);
    return (React.createElement("div", { className: cx('queryResultsContainer', 'container') },
        React.createElement(EuiInMemoryTable, { pagination: true, items: result !== null && result !== void 0 ? result : [], loading: !result, message: noResultMessage, columns: columns, className: cx({
                table: true,
                inMemoryTableDefault: true,
                tableWithPagination: (result === null || result === void 0 ? void 0 : result.length) > 10,
            }), responsive: false, "data-testid": "query-table-result-".concat(query) })));
});
export default TableView;
//# sourceMappingURL=TableView.js.map