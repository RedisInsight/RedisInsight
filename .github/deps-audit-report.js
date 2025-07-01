const fs = require('fs');

const FILENAME = process.env.FILENAME;
const DEPS = process.env.DEPS || '';
const file = `${FILENAME}`;
const outputFile = `slack.${FILENAME}`;

function generateSlackMessage(metadata) {
  const message = {
    text:
      `DEPS AUDIT: *${DEPS}* result (Branch: *${process.env.GITHUB_REF_NAME}*)` +
      `\nScanned ${metadata.dependencies.prod} prod + ${metadata.dependencies.dev} dev dependencies` +
      `\n<https://github.com/RedisInsight/RedisInsight/actions/runs/${process.env.GITHUB_RUN_ID}|View on Github Actions>`,
    attachments: [],
  };

  const vulns = metadata.vulnerabilities;

  if (vulns.total > 0) {
    if (vulns.critical) {
      message.attachments.push({
        title: 'Critical',
        color: '#641E16',
        text: `${vulns.critical}`,
      });
    }
    if (vulns.high) {
      message.attachments.push({
        title: 'High',
        color: '#C0392B',
        text: `${vulns.high}`,
      });
    }
    if (vulns.moderate) {
      message.attachments.push({
        title: 'Moderate',
        color: '#F5B041',
        text: `${vulns.moderate}`,
      });
    }
    if (vulns.low) {
      message.attachments.push({
        title: 'Low',
        color: '#F9E79F',
        text: `${vulns.low}`,
      });
    }
    if (vulns.info) {
      message.attachments.push({
        title: 'Info',
        text: `${vulns.info}`,
      });
    }
  } else {
    message.attachments.push({
      title: 'No vulnerabilities found',
      color: 'good',
    });
  }

  return message;
}

async function main() {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const auditReport = JSON.parse(raw);
    const metadata = auditReport.metadata;

    fs.writeFileSync(
      outputFile,
      JSON.stringify({
        channel: process.env.SLACK_AUDIT_REPORT_CHANNEL,
        ...generateSlackMessage(metadata),
      }),
    );
  } catch (err) {
    console.error(`Error parsing audit JSON: ${err}`);
    process.exit(1);
  }
}

main();
