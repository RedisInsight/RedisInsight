function _extends() {
  _extends =
    Object.assign ||
    function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  return _extends.apply(this, arguments);
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}

import * as React from 'react';

var EuiIconEmpty = function EuiIconEmpty(_ref) {
  var title = _ref.title,
    titleId = _ref.titleId,
    props = _objectWithoutProperties(_ref, ['title', 'titleId']);

  // For e2e tests. TestCafe is failing for default icons
  try {
    document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    return /*#__PURE__*/ React.createElement(
      'svg',
      _extends(
        {
          width: 16,
          height: 16,
          viewBox: '0 0 16 16',
          xmlns: 'http://www.w3.org/2000/svg',
          'aria-labelledby': titleId,
        },
        props,
      ),
    );
  } catch (e) {
    return <span>''</span>;
  }
};

export var icon = EuiIconEmpty;
