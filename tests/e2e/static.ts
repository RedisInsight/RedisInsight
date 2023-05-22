const express = require('express');
const fs = require('fs-extra');
const path = require('path');

fs.ensureDir('./remote');
const jsonFilePath = path.join('/remote', 'features-config.json');

const app = express();
app.use('/remote', express.static('./remote'));

app.put('/remote/features-config.json', (req, res) => {
    const jsonData = req.body;
    fs.writeFile(jsonFilePath, JSON.stringify(jsonData), (err) => {
      if (err) {
        console.error('Error updating features config file:', err);
        res.status(500).send('Error updating features config file');
      } else {
        console.log('Features config file updated successfully.');
        res.send('Features config file updated successfully');
      }
    });
  });

app.listen(5551);
