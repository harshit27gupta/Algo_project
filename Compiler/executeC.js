import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const __dirname = path.resolve();
const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeC = (filePath, inputFilePath = null) => {
  const jobId = path.basename(filePath).split(".")[0];
  const outputFileName = `${jobId}.out`;
  const outPath = path.join(outputPath, outputFileName);

  return new Promise((resolve, reject) => {
    // Step 1: Compile
    exec(`gcc -Werror=return-type  "${filePath}" -o "${outPath}"`, (compileErr, compileStdout, compileStderr) => {
      if (compileErr) {
        console.log('C compilation error - compileStderr:', compileStderr);
        console.log('C compilation error - compileErr:', compileErr);
        setTimeout(() => { try { fs.unlinkSync(filePath); } catch (e) {
          console.log("Error deleting file:", e);
        } }, 20000);
        return reject({ error: compileStderr, stderr: compileStderr });
      }
      // Step 2: Run
      let runCmd = `"${outPath}"`;
      if (inputFilePath) {
        runCmd = `"${outPath}" < "${inputFilePath}"`;
      }
      const startTime = Date.now();
      exec(runCmd, (runErr, runStdout, runStderr) => {
        const execTime = Date.now() - startTime;
        setTimeout(() => { try { fs.unlinkSync(filePath); } catch (e) {
          console.log("Error deleting file:", e);
        } }, 20000);
        setTimeout(() => { try { fs.unlinkSync(outPath); } catch (e) {
          console.log("Error deleting output file:", e);
        } }, 20000);
        if (runErr) {
          console.log('C runtime error - runStderr:', runStderr);
          console.log('C runtime error - runErr:', runErr);
          return reject({ error: runStderr, stderr: runStderr });
        }
        resolve({ stdout: runStdout, stderr: runStderr, execTime });
      });
    });
  });
};

export default executeC;
