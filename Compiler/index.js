import express from 'express';
import { generateFile, generateInputFile } from './generateFile.js';
import executeCpp from './executeCpp.js';
import executeC from './executeC.js';
import executeJava from './executeJava.js';
import sanitizeCode from './sanitizeCode.js';
import fs from 'fs';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Compiler microservice is running!');
});

app.post('/compile', async (req, res) => {
  let { language, code, input } = req.body;

  if (!language) {
    return res.status(400).json({ error: 'Please provide a language.' });
  }
  if (!code) {
    return res.status(400).json({ error: 'Please provide code to compile.' });
  }

  code = sanitizeCode(language, code);

  let filePath = null;
  let inputFilePath = null;
  try {
    filePath = generateFile(language, code);
    if (input) {
      inputFilePath = generateInputFile(input);
    }
    let result = {};
    switch (language) {
      case 'cpp':
        result = await executeCpp(filePath, inputFilePath);
        break;
      case 'c':
        result = await executeC(filePath, inputFilePath);
        break;
      case 'java':
        result = await executeJava(filePath, inputFilePath);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported language.' });
    }
    if (inputFilePath) {
      setTimeout(() => { try { fs.unlinkSync(inputFilePath); } catch (e) {
        console.log("Error deleting input file:", e);
      } }, 20000);
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
