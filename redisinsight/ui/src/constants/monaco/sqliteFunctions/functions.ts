export default {
  date: {
    summary: 'returns the date as text in this format: YYYY-MM-DD',
    arguments: [
      {
        name: 'time_value',
        type: 'number',
        display_text: 'optional time value',
        optional: false
      },
      {
        name: 'modifier',
        type: 'string',
        display_text: 'optional one or more modifiers',
        optional: true
      }
    ]
  },
  time: {
    summary: 'returns the time as text in this format: HH:MM:SS',
    arguments: [
      {
        name: 'time_value',
        type: 'number',
        display_text: 'optional time value',
        optional: false
      },
      {
        name: 'modifier',
        type: 'string',
        display_text: 'optional one or more modifiers',
        optional: true
      }
    ]
  },
  datetime: {
    summary: 'returns the date and time as text in this formats: YYYY-MM-DD HH:MM:SS',
    arguments: [
      {
        name: 'time_value',
        type: 'number',
        display_text: 'optional time value',
        optional: false
      },
      {
        name: 'modifier',
        type: 'string',
        display_text: 'optional one or more modifiers',
        optional: true
      }
    ]
  },
  julianday: {
    summary: 'the fractional number of days since noon in Greenwich on November 24, 4714 B.C.',
    arguments: [
      {
        name: 'time_value',
        type: 'number',
        display_text: 'optional time value',
        optional: false
      },
      {
        name: 'modifier',
        type: 'string',
        display_text: 'optional one or more modifiers',
        optional: true
      }
    ]
  },
  unixepoch: {
    summary: 'returns a unix timestamp - the number of seconds since 1970-01-01 00:00:00 UTC.',
    arguments: [
      {
        name: 'time_value',
        type: 'number',
        display_text: 'optional time value',
        optional: false
      },
      {
        name: 'modifier',
        type: 'string',
        display_text: 'optional one or more modifiers',
        optional: true
      }
    ]
  },
  strftime: {
    summary: 'returns the date formatted according to the format string specified as the first argument. The format string supports the most common substitutions found in the strftime() function from the standard C library plus two new substitutions, %f and %J',
    arguments: [
      {
        name: 'format',
        type: 'string',
        display_text: 'supports the most common substitutions found in the strftime() function',
        optional: false
      },
      {
        name: 'time_value',
        type: 'number',
        display_text: 'optional time value',
        optional: false
      },
      {
        name: 'modifier',
        type: 'string',
        display_text: 'optional one or more modifiers',
        optional: true
      }
    ]
  },
  timediff: {
    summary: 'returns a string that describes the amount of time that must be added to B in order to reach time A. The format of the timediff() result is designed to be human-readable. The format is:(+|-)YYYY-MM-DD HH:MM:SS.SSS',
    arguments: [
      {
        name: 'time_value',
        type: 'number',
        display_text: 'time to start from',
        optional: false
      },
    ]
  },
  avg: {
    summary: 'returns the average value of all non-NULL X within a group. String and BLOB values that do not look like numbers are interpreted as 0.',
    arguments: [
      {
        name: 'column_name',
        type: 'string',
        display_text: 'column name',
        optional: false
      }
    ]
  },
  count: {
    summary: 'returns a count of the number of times that X is not NULL in a group.',
    arguments: [
      {
        name: 'column_name',
        type: 'string',
        display_text: 'column name',
        optional: false
      }
    ]
  },
  group_concat: {
    summary: "The group_concat() function returns a string which is the concatenation of all non-NULL values of X. If parameter Y is present then it is used as the separator between instances of X.A comma (',') is used as the separator if Y is omitted.",
    arguments: [
      {
        name: 'column_name',
        type: 'string',
        display_text: 'column name',
        optional: false
      },
      {
        name: 'separator',
        type: 'string',
        display_text: 'separator',
        optional: true
      }
    ]
  },
  string_agg: {
    summary: "The group_concat() function returns a string which is the concatenation of all non-NULL values of X. If parameter Y is present then it is used as the separator between instances of X.A comma (',') is used as the separator if Y is omitted.",
    arguments: [
      {
        name: 'column_name',
        type: 'string',
        display_text: 'column name',
        optional: false
      },
      {
        name: 'separator',
        type: 'string',
        display_text: 'separator',
        optional: true
      }
    ]
  },
  max: {
    summary: 'returns the maximum value of all values in the group',
    arguments: [
      {
        name: 'column_name',
        type: 'string',
        display_text: 'column name',
        optional: false
      }
    ]
  },
  min: {
    summary: 'returns the minimum value of all values in the group',
    arguments: [
      {
        name: 'column_name',
        type: 'string',
        display_text: 'column name',
        optional: false
      }
    ]
  },
  sum: {
    summary: 'return the sum of all non-NULL values in the group.',
    arguments: [
      {
        name: 'column_name',
        type: 'string',
        display_text: 'column name',
        optional: false
      }
    ]
  },
  total: {
    summary: 'return the sum of all non-NULL values in the group.',
    arguments: [
      {
        name: 'column_name',
        type: 'string',
        display_text: 'column name',
        optional: false
      }
    ]
  }
}
