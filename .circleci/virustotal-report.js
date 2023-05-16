const fs = require('fs');

const fileName = process.env.FILE_NAME;
const buildName = process.env.BUILD_NAME;
const failed = !!parseInt(process.env.VIRUS_CHECK_FAILED, 10);

const results = {
  message: {
    text: `*Virustotal checks* (Branch: *${process.env.CIRCLE_BRANCH}*)` +
      `\n<https://app.circleci.com/pipelines/workflows/${process.env.CIRCLE_WORKFLOW_ID}|View on CircleCI>`,
    attachments: [],
  },
};

const result = {
  color: '#36a64f',
  title: `Finished at: ${new Date().toISOString()}`,
  text: `All builds were passed via virustotal checks`,
  fields: [],
};

if (failed) {
  results.passed = false;
  result.color = '#cc0000';
  result.fields.push({
    title: 'Failed build',
    value: buildName,
    short: true,
  });
}

results.message.attachments.push(result);

if (failed === true) {
  results.message.text = '<!here> ' + results.message.text;
}

fs.writeFileSync(fileName, JSON.stringify({
  channel: process.env.SLACK_VIRUSTOTAL_REPORT_CHANNEL,
  ...results.message,
}));
