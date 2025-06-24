import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const __dirname = path.resolve();
const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeC = (filePath) => {
  const jobId = path.basename(filePath).split(".")[0];
  const outputFileName = `${jobId}.out`;
  const outPath = path.join(outputPath, outputFileName);

  return new Promise((resolve, reject) => {
    exec(`gcc "${filePath}" -o "${outPath}" && "${outPath}"`, (error, stdout, stderr) => {
      const cleanStdout = (stdout || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trimEnd();
      const cleanStderr = (stderr || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trimEnd();

      setTimeout(() => { try { fs.unlinkSync(filePath); } catch (e) {
        console.log("Error deleting file:", e);
      } }, 20000);
      setTimeout(() => { try { fs.unlinkSync(outPath); } catch (e) {
        console.log("Error deleting output file:", e);
      } }, 20000);

      if (error) {
        return reject({ error: error.message, stderr: cleanStderr });
      }
      
      resolve({ stdout: cleanStdout, stderr: cleanStderr });
    });
  });
};

export default executeC;
