const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

function onBeforeWriteHook(writeInfo) {
  if (writeInfo.initiator === 'reportTestDone') {
    const { name, testRunInfo, meta } = writeInfo.data || {};
    const testDuration = testRunInfo.durationMs;
    // Modify the XML content to include test duration
    const xmlContent = writeInfo.formattedText;

    xml2js.parseString(xmlContent, (err, result) => {
      if (err) {
        console.error('Error parsing XML:', err);
        return;
      }

      if (result.testsuite && Array.isArray(result.testsuite)) {
        result.testsuite.forEach(suite => {
          if (suite.testcase && Array.isArray(suite.testcase)) {
            suite.testcase.forEach(test => {
              if (!test.$.time) {
                test.$.time = `${testDuration / 1000}`;
              }
            });
          }
        });
      }

      const builder = new xml2js.Builder();
      writeInfo.formattedText = builder.buildObject(result);
    });
  }
}

module.exports = {
  hooks: {
    reporter: {
      junit: {
        onBeforeWrite: onBeforeWriteHook,
      },
    },
  },
}
