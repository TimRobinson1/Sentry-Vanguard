import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import dotenv from 'dotenv';

import scripts from '../scripts';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/scripts/:scriptId', async (req, res) => {
  const { noAwait, ...scriptOptions } = (req.body || {})
  const script = scripts.find(script => script.id === req.params.scriptId);

  let result;
  if (script) {
    if (noAwait) {
      script.run(scriptOptions);
      result = { status: 'pending' }
    } else {
      try {
        await script.run(scriptOptions);
        result = { status: 'success' }
      } catch (err) {
        result = { status: 'failure', message: err.message }
      }
    }
  } else {
    result = { status: 'failure', message: 'Script not found' }
  }

  res.send(result);
  console.log(script?.name);
});

// Serve any static files
app.use(express.static(path.join(__dirname, '../../', 'build')));

// Handle React routing, return all requests to React app
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '../../', 'build', 'index.html'));
});


app.listen(port, () => console.log(`Listening on port ${port}`));