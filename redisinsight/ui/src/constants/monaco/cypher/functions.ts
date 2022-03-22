export default [
  {
    name: 'all',
    signature: '(variable :: VARIABLE IN list :: LIST OF ANY? WHERE predicate :: ANY?) :: (BOOLEAN?)',
    description: 'Returns true if the predicate holds for all elements in the given list.'
  },
  {
    name: 'any',
    signature: '(variable :: VARIABLE IN list :: LIST OF ANY? WHERE predicate :: ANY?) :: (BOOLEAN?)',
    description: 'Returns true if the predicate holds for at least one element in the given list.'
  },
  {
    name: 'exists',
    signature: '(input :: ANY?) :: (BOOLEAN?)',
    description: 'Returns true if a match for the pattern exists in the graph, or if the specified property exists in the node, relationship or map.'
  },
  {
    name: 'isEmpty',
    signature: '(input :: LIST? OF ANY? | MAP? | STRING?) :: (BOOLEAN?)',
    description: 'Checks whether a list/map/string is empty.'
  },
  {
    name: 'none',
    signature: '(variable :: VARIABLE IN list :: LIST OF ANY? WHERE predicate :: ANY?) :: (BOOLEAN?)',
    description: 'Returns true if the predicate holds for no element in the given list.'
  },
  {
    name: 'single',
    signature: '(variable :: VARIABLE IN list :: LIST OF ANY? WHERE predicate :: ANY?) :: (BOOLEAN?)',
    description: 'Returns true if the predicate holds for exactly one of the elements in the given list.'
  },
  {
    name: 'coalesce',
    signature: '(input :: ANY?) :: (ANY?)',
    description: 'Returns the first non-null value in a list of expressions.'
  },
  {
    name: 'endNode',
    signature: '(input :: RELATIONSHIP?) :: (NODE?)',
    description: 'Returns the end node of a relationship.'
  },
  {
    name: 'head',
    signature: '(list :: LIST? OF ANY?) :: (ANY?)',
    description: 'Returns the first element in a list.'
  },
  {
    name: 'id',
    signature: '(input :: NODE? | RELATIONSHIP?) :: (INTEGER?)',
    description: 'Returns the id of a node/relationship.'
  },
  {
    name: 'last',
    signature: '(list :: LIST? OF ANY?) :: (ANY?)',
    description: 'Returns the last element in a list.'
  },
  {
    name: 'length',
    signature: '(input :: PATH?) :: (INTEGER?)',
    description: 'Returns the length of a path.'
  },
  {
    name: 'properties',
    signature: '(input :: MAP? | NODE? | RELATIONSHIP?) :: (MAP?)',
    description: 'Returns a map containing all the properties of a map/node/relationship.'
  },
  {
    name: 'randomUUID',
    signature: '() :: (STRING?)',
    description: 'Generates a random UUID.'
  },
  {
    name: 'size',
    signature: '(input :: LIST? OF ANY?) :: (INTEGER?)',
    description: 'Returns the number of items in a list.'
  },
  {
    name: 'startNode',
    signature: '(input :: RELATIONSHIP?) :: (NODE?)',
    description: 'Returns the start node of a relationship.'
  },
  {
    name: 'timestamp',
    signature: '() :: (INTEGER?)',
    description: 'Returns the difference, measured in milliseconds, between the current time and midnight, January 1, 1970 UTC.'
  },
  {
    name: 'toBoolean',
    signature: '(input :: STRING? | BOOLEAN? | INTEGER?) :: (BOOLEAN?)',
    description: 'Converts a string value to a boolean value.'
  },
  {
    name: 'toBooleanOrNull',
    signature: '(input :: ANY?) :: (BOOLEAN?)',
    description: 'Converts a value to a boolean value, or null if the value cannot be converted.'
  },
  {
    name: 'toFloat',
    signature: '(input :: NUMBER? | STRING?) :: (FLOAT?)',
    description: 'Converts a number value to a floating point value.'
  },
  {
    name: 'toFloatOrNull',
    signature: '(input :: ANY?) :: (FLOAT?)',
    description: 'Converts a value to a floating point value, or null if the value cannot be converted.'
  },
  {
    name: 'toInteger',
    signature: '(input :: NUMBER? | BOOLEAN? | STRING?) :: (INTEGER?)',
    description: 'Converts a number value to an integer value.'
  },
  {
    name: 'toIntegerOrNull',
    signature: '(input :: ANY?) :: (INTEGER?)',
    description: 'Converts a value to an integer value, or null if the value cannot be converted.'
  },
  {
    name: 'type',
    signature: '(input :: RELATIONSHIP?) :: (STRING?)',
    description: 'Returns the string representation of the relationship type.'
  },
  {
    name: 'avg',
    signature: '(input :: DURATION? | FLOAT? | INTEGER?) :: (DURATION? | FLOAT? | INTEGER?)',
    description: 'Returns the average of a set of duration values.'
  },
  {
    name: 'collect',
    signature: '(input :: ANY?) :: (LIST? OF ANY?)',
    description: 'Returns a list containing the values returned by an expression.'
  },
  {
    name: 'count',
    signature: '(input :: ANY?) :: (INTEGER?)',
    description: 'Returns the number of values or rows.'
  },
  {
    name: 'max',
    signature: '(input :: ANY?) :: (ANY?)',
    description: 'Returns the maximum value in a set of values.'
  },
  {
    name: 'min',
    signature: '(input :: ANY?) :: (ANY?)',
    description: 'Returns the minimum value in a set of values.'
  },
  {
    name: 'percentileCont',
    signature: '(input :: FLOAT?, percentile :: FLOAT?) :: (FLOAT?)',
    description: 'Returns the percentile of a value over a group using linear interpolation.'
  },
  {
    name: 'percentileDisc',
    signature: '(input :: FLOAT? | INTEGER?, percentile :: FLOAT?) :: (FLOAT? | INTEGER?)',
    description: 'Returns the nearest value to the given percentile over a group using a rounding method.'
  },
  {
    name: 'stDev',
    signature: '(input :: FLOAT?) :: (FLOAT?)',
    description: 'Returns the standard deviation for the given value over a group for a sample of a population.'
  },
  {
    name: 'stDevp',
    signature: '(input :: FLOAT?) :: (FLOAT?)',
    description: 'Returns the standard deviation for the given value over a group for an entire population.'
  },
  {
    name: 'sum',
    signature: '(input :: DURATION? | FLOAT? | INTEGER?) :: (DURATION? | FLOAT? | INTEGER?)',
    description: 'Returns the sum of a set of numeric values.'
  },
  {
    name: 'keys',
    signature: '(input :: MAP? | NODE? | RELATIONSHIP?) :: (LIST? OF STRING?)',
    description: 'Returns a list containing the string representations for all the property names of a node, relationship, or map.'
  },
  {
    name: 'labels',
    signature: '(input :: NODE?) :: (LIST? OF STRING?)',
    description: 'Returns a list containing the string representations for all the labels of a node.'
  },
  {
    name: 'nodes',
    signature: '(input :: PATH?) :: (LIST? OF NODE?)',
    description: 'Returns a list containing all the nodes in a path.'
  },
  {
    name: 'range',
    signature: '(start :: INTEGER?, end :: INTEGER?, step? :: INTEGER?) :: (LIST? OF INTEGER?)',
    description: 'Returns a list comprising all integer values within a specified range.'
  },
  {
    name: 'relationships',
    signature: '(input :: PATH?) :: (LIST? OF RELATIONSHIP?)',
    description: 'Returns a list containing all the relationships in a path.'
  },
  {
    name: 'reverse',
    signature: '(input :: LIST? OF ANY?) :: (LIST? OF ANY?)',
    description: 'Returns a list in which the order of all elements in the original list have been reversed.'
  },
  {
    name: 'tail',
    signature: '(input :: LIST? OF ANY?) :: (LIST? OF ANY?)',
    description: 'Returns all but the first element in a list.'
  },
  {
    name: 'toBooleanList',
    signature: '(input :: LIST? OF ANY?) :: (LIST? OF BOOLEAN?)',
    description: 'Converts a list of values to a list of boolean values. If any values are not convertible to boolean they will be null in the list returned.'
  },
  {
    name: 'toFloatList',
    signature: '(input :: LIST? OF ANY?) :: (LIST? OF FLOAT?)',
    description: 'Converts a list of values to a list of floating point values. If any values are not convertible to floating point they will be null in the list returned.'
  },
  {
    name: 'toIntegerList',
    signature: '(input :: LIST? OF ANY?) :: (LIST? OF INTEGER?)',
    description: 'Converts a list of values to a list of integer values. If any values are not convertible to integer they will be null in the list returned.'
  },
  {
    name: 'toStringList',
    signature: '(input :: LIST? OF ANY?) :: (LIST? OF STRING?)',
    description: 'Converts a list of values to a list of string values. If any values are not convertible to string they will be null in the list returned.'
  },
  {
    name: 'abs',
    signature: '(input :: FLOAT? | INTEGER?) :: (FLOAT? | INTEGER?)',
    description: 'Returns the absolute value of a floating point number.'
  },
  {
    name: 'ceil',
    signature: '(input :: FLOAT?) :: (FLOAT?)',
    description: 'Returns the smallest floating point number that is greater than or equal to a number and equal to a mathematical integer.'
  },
  {
    name: 'floor',
    signature: '(input :: FLOAT?) :: (FLOAT?)',
    description: 'Returns the largest floating point number that is less than or equal to a number and equal to a mathematical integer.'
  },
  {
    name: 'rand',
    signature: '() :: (FLOAT?)',
    description: 'Returns a random floating point number in the range from 0 (inclusive) to 1 (exclusive); i.e. [0,1).'
  },
  {
    name: 'round',
    signature: '(input :: FLOAT?, precision? :: NUMBER?, mode? :: STRING?) :: (FLOAT?)',
    description: 'Returns the value of a number rounded to the nearest integer.'
  },
  {
    name: 'sign',
    signature: '(input :: FLOAT? | INTEGER?) :: (INTEGER?)',
    description: 'Returns the signum of a floating point number: 0 if the number is 0, -1 for any negative number, and 1 for any positive number.'
  },
  {
    name: 'e',
    signature: '() :: (FLOAT?)',
    description: 'Returns the base of the natural logarithm, e.'
  },
  {
    name: 'exp',
    signature: '(input :: FLOAT?) :: (FLOAT?)',
    description: 'Returns e^n, where e is the base of the natural logarithm, and n is the value of the argument expression.'
  },
  {
    name: 'log',
    signature: '(input :: FLOAT?) :: (FLOAT?)',
    description: 'Returns the natural logarithm of a number.'
  },
  {
    name: 'log10',
    signature: '(input :: FLOAT?) :: (FLOAT?)',
    description: 'Returns the common logarithm (base 10) of a number.'
  },
  {
    name: 'sqrt',
    signature: '(input :: FLOAT?) :: (FLOAT?)',
    description: 'Returns the square root of a number.'
  },
  {
    name: 'acos',
    signature: '(input :: FLOAT?) :: (FLOAT?)',
    description: 'Returns the arccosine of a number in radians.'
  },
  {
    name: 'asin',
    signature: '(input :: FLOAT?) :: (FLOAT?)',
    description: 'Returns the arcsine of a number in radians.'
  },
  {
    name: 'atan',
    signature: '(input :: FLOAT?) :: (FLOAT?)',
    description: 'Returns the arctangent of a number in radians.'
  },
  {
    name: 'atan2',
    signature: '(y :: FLOAT?, x :: FLOAT?) :: (FLOAT?)',
    description: 'Returns the arctangent2 of a set of coordinates in radians.'
  },
  {
    name: 'cos',
    signature: '(input :: FLOAT?) :: (FLOAT?)',
    description: 'Returns the cosine  of a number.'
  },
  {
    name: 'cot',
    signature: '(input :: FLOAT?) :: (FLOAT?)',
    description: 'Returns the cotangent of a number.'
  },
  {
    name: 'degrees',
    signature: '(input :: FLOAT?) :: (FLOAT?)',
    description: 'Converts radians to degrees.'
  },
  {
    name: 'haversin',
    signature: '(input :: FLOAT?) :: (FLOAT?)',
    description: 'Returns half the versine of a number.'
  },
  {
    name: 'pi',
    signature: '() :: (FLOAT?)',
    description: 'Returns the mathematical constant pi.'
  },
  {
    name: 'radians',
    signature: '(input :: FLOAT?) :: (FLOAT?)',
    description: 'Converts degrees to radians.'
  },
  {
    name: 'sin',
    signature: '(input :: FLOAT?) :: (FLOAT?)',
    description: 'Returns the sine of a number.'
  },
  {
    name: 'tan',
    signature: '(input :: FLOAT?) :: (FLOAT?)',
    description: 'Returns the tangent of a number.'
  },
  {
    name: 'left',
    signature: '(original :: STRING?, length :: INTEGER?) :: (STRING?)',
    description: 'Returns a string containing the specified number of leftmost characters of the original string.'
  },
  {
    name: 'lTrim',
    signature: '(input :: STRING?) :: (STRING?)',
    description: 'Returns the original string with leading whitespace removed.'
  },
  {
    name: 'replace',
    signature: '(original :: STRING?, search :: STRING?, replace :: STRING?) :: (STRING?)',
    description: 'Returns a string in which all occurrences of a specified search string in the original string have been replaced by another (specified) replace string.'
  },
  {
    name: 'reverse',
    signature: '(input :: STRING?) :: (STRING?)',
    description: 'Returns a string in which the order of all characters in the original string have been reversed.'
  },
  {
    name: 'right',
    signature: '(original :: STRING?, length :: INTEGER?) :: (STRING?)',
    description: 'Returns a string containing the specified number of rightmost characters of the original string.'
  },
  {
    name: 'rTrim',
    signature: '(input :: STRING?) :: (STRING?)',
    description: 'Returns the original string with trailing whitespace removed.'
  },
  {
    name: 'split',
    signature: '(original :: STRING?, splitDelimiter :: STRING? | LIST? OF STRING?) :: (LIST? OF STRING?)',
    description: 'Returns a list of strings resulting from the splitting of the original string around matches of (any) the given delimiter.'
  },
  {
    name: 'substring',
    signature: '(original :: STRING?, start :: INTEGER?, length? :: INTEGER?) :: (STRING?)',
    description: 'Returns a substring of (length \'length\') the original string, beginning with a 0-based index start.'
  },
  {
    name: 'toLower',
    signature: '(input :: STRING?) :: (STRING?)',
    description: 'Returns the original string in lowercase.'
  },
  {
    name: 'toString',
    signature: '(input :: ANY?) :: (STRING?)',
    description: 'Converts an integer, float, boolean, point or temporal type (i.e. Date, Time, LocalTime, DateTime, LocalDateTime or Duration) value to a string.'
  },
  {
    name: 'toStringOrNull',
    signature: '(input :: ANY?) :: (STRING?)',
    description: 'Converts an integer, float, boolean, point or temporal type (i.e. Date, Time, LocalTime, DateTime, LocalDateTime or Duration) value to a string, or null if the value cannot be converted.'
  },
  {
    name: 'toUpper',
    signature: '(input :: STRING?) :: (STRING?)',
    description: 'Returns the original string in uppercase.'
  },
  {
    name: 'trim',
    signature: '(input :: STRING?) :: (STRING?)',
    description: 'Returns the original string with leading and trailing whitespace removed.'
  }
]
