import express from 'express';
import generateFile from './generateFile.js';
import executeCpp from './executeCpp.js';
import executeC from './executeC.js';
import executeJava from './executeJava.js';
import sanitizeCode from './sanitizeCode.js';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Compiler microservice is running!');
});

app.post('/compile', async (req, res) => {
  let { language, code } = req.body;

  if (!language) {
    return res.status(400).json({ error: 'Please provide a language.' });
  }
  if (!code) {
    return res.status(400).json({ error: 'Please provide code to compile.' });
  }

  code = sanitizeCode(language, code);

  let filePath = null;
  try {
    filePath = generateFile(language, code);
    let result = {};
    switch (language) {
      case 'cpp':
        result = await executeCpp(filePath);
        break;
      case 'c':
        result = await executeC(filePath);
        break;
      case 'java':
        result = await executeJava(filePath);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported language.' });
    }
    return res.json({
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      exitCode: result.exitCode !== undefined ? result.exitCode : 0
    });
  } catch (error) {
    console.error('Compilation error:', error);
    return res.status(500).json({
      stdout: '',
      stderr: error.stderr || error.error || String(error),
      exitCode: error.exitCode !== undefined ? error.exitCode : 1
    });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Compiler service listening on port ${PORT}`);
});
