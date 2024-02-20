var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import React from 'react';
import { instance, mock } from 'ts-mockito';
import TableView from './TableView';
import { render, waitFor } from '../../../../../RedisInsight/redisinsight/ui/src/utils/test-utils';
var mockedProps = mock();
describe.skip('TableResult', function () {
    it('should render', function () {
        expect(render(React.createElement(TableView, __assign({}, instance(mockedProps))))).toBeTruthy();
    });
    it('Result element should be "Not found." meanwhile result is [0]', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, queryByTestId, rerender, resultEl;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = render(React.createElement(TableView, __assign({}, instance(mockedProps), { result: null, query: "ft.search" }))), queryByTestId = _a.queryByTestId, rerender = _a.rerender;
                    return [4 /*yield*/, waitFor(function () {
                            rerender(React.createElement(TableView, __assign({}, instance(mockedProps), { result: [], query: "ft.search" })));
                        })];
                case 1:
                    _b.sent();
                    resultEl = queryByTestId(/query-table-no-results/);
                    expect(resultEl).toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    it('Result element should have 4 cell meanwhile result is not empty', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result, _a, queryByTestId, queryAllByTestId, rerender, resultEl, columnsEl;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    result = [
                        {
                            Doc: 'red:2',
                            title: 'Redis Labs',
                        },
                        {
                            Doc: 'red:1',
                            title: 'Redis Labs',
                        },
                    ];
                    _a = render(React.createElement(TableView, __assign({}, instance(mockedProps), { result: [], query: "ft.search" }))), queryByTestId = _a.queryByTestId, queryAllByTestId = _a.queryAllByTestId, rerender = _a.rerender;
                    return [4 /*yield*/, waitFor(function () {
                            rerender(React.createElement(TableView, __assign({}, instance(mockedProps), { result: result, query: "ft.search" })));
                        })];
                case 1:
                    _b.sent();
                    resultEl = queryByTestId(/query-table-result/);
                    columnsEl = queryAllByTestId(/query-column/);
                    expect(resultEl).toBeInTheDocument();
                    expect(columnsEl === null || columnsEl === void 0 ? void 0 : columnsEl.length).toEqual(4);
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=TableView.spec.js.map