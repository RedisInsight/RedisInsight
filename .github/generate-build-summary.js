const fs = require('fs');
const path = require('path');

const { writeFile } = fs.promises;

const Categories = {
  Linux: 'Linux Builds',
  MacOS: 'MacOS Builds',
  Windows: 'Windows Builds',
  Docker: 'Docker Builds',
};

const directoryPath = path.join(process.cwd(), 'release');
const dockerDirectoryPath = path.join(directoryPath, 'docker');

async function generateBuildSummary() {
  try {
    // Read the contents of the release directory and Docker subdirectory
    const files = fs.readdirSync(directoryPath);
    const dockerFiles = fs.readdirSync(dockerDirectoryPath).map(file => `docker/${file}`);

    // Combine all files into a single array
    const allFiles = [...files, ...dockerFiles];

    // Mapping file names to Markdown links and categories
    const fileMappings = {
      'Redis-Insight-linux-amd64.deb': { name: 'Redis Insight for Linux (deb)', category: Categories.Linux },
      'Redis-Insight-linux-amd64.snap': { name: 'Redis Insight for Linux (snap)', category: Categories.Linux },
      'Redis-Insight-linux-x86_64.AppImage': { name: 'Redis Insight for Linux (AppImage)', category: Categories.Linux },
      'Redis-Insight-linux-x86_64.rpm': { name: 'Redis Insight for Linux (rpm)', category: Categories.Linux },
      'Redis-Insight-mac-arm64.dmg': { name: 'Redis Insight for Mac (arm64 DMG)', category: Categories.MacOS },
      'Redis-Insight-mac-x64.dmg': { name: 'Redis Insight for Mac (x64 DMG)', category: Categories.MacOS },
      'Redis-Insight-win-installer.exe': { name: 'Redis Insight Windows Installer (exe)', category: Categories.Windows },
      'docker/docker-linux-alpine.amd64.tar': { name: 'Redis Insight Docker Image (amd64)', category: Categories.Docker },
      'docker/docker-linux-alpine.arm64.tar': { name: 'Redis Insight Docker Image (arm64)', category: Categories.Docker },
    };

    const categories = {};

    // Populate categories with existing files
    allFiles.forEach(file => {
      const mapping = fileMappings[file];
      if (mapping) {
        if (!categories[mapping.category]) {
          categories[mapping.category] = [];
        }
        categories[mapping.category].push(`- [${mapping.name}](./release/${file})`);
      }
    });

    // Prepare the summary markdown document
    const markdownLines = ['# Builds:', ''];

    // Append categories to markdown if they have entries
    Object.keys(categories).forEach(category => {
      if (categories[category].length) {
        markdownLines.push(`## ${category}`, '', ...categories[category], '');
      }
    });

    const data = markdownLines.join('\n');
    const summaryFilePath = process.env.GITHUB_STEP_SUMMARY

    await writeFile(summaryFilePath, data, { encoding: 'utf8' });

    // // Write the formatted summary to GitHub Actions output
    // core.summary
    //   .addRaw(markdownLines.join('\n'))
    //   .write();

    console.log('Build summary generated successfully.');

  } catch (error) {
    // core.setFailed(`Error generating build summary: ${error.message}`);
  }
}

generateBuildSummary();
