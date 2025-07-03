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
  const startTime = Date.now();
  console.log(`🔧 [COMPILE] Starting compilation - Language: ${req.body.language} - IP: ${req.ip}`);
  
  let { language, code, input } = req.body;

  if (!language) {
    console.log(`❌ [COMPILE] Missing language parameter`);
    return res.status(400).json({ error: 'Please provide a language.' });
  }
  if (!code) {
    console.log(`❌ [COMPILE] Missing code parameter`);
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
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    console.log(`✅ [COMPILE] Compilation completed - Language: ${language} - Total time: ${totalTime}ms - Exec time: ${result.execTime || 'N/A'}ms`);
    
    return res.json({
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      exitCode: result.exitCode !== undefined ? result.exitCode : 0,
      execTime: result.execTime !== undefined ? result.execTime : null
    });
  } catch (error) {
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    console.log(`❌ [COMPILE] Compilation failed - Language: ${language} - Total time: ${totalTime}ms`);
    console.error('Compilation error:', error);
    console.error('Error type:', typeof error);
    console.error('Error keys:', Object.keys(error));
    console.error('Error.stderr:', error.stderr);
    console.error('Error.error:', error.error);
    
    let stderrMessage = '';
    if (error.stderr) {
      stderrMessage = typeof error.stderr === 'string' ? error.stderr : JSON.stringify(error.stderr);
    } else if (error.error) {
      stderrMessage = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
    } else {
      stderrMessage = typeof error === 'string' ? error : JSON.stringify(error);
    }
    
    console.error('Final stderr message:', stderrMessage);
    
    return res.status(500).json({
      stdout: '',
      stderr: stderrMessage,
      exitCode: error.exitCode !== undefined ? error.exitCode : 1
    });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Compiler service listening on port ${PORT}`);
});
