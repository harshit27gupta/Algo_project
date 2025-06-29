import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const __dirname = path.resolve();
const outputPath = path.join(__dirname, "outputs");
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

const executeJava = (filePath, inputFilePath = null) => {
    const jobId = path.basename(filePath, '.java');
    const dir = path.dirname(filePath);
    const classFile = path.join(dir, `${jobId}.class`);

    return new Promise((resolve, reject) => {
        let runCmd = `javac "${filePath}" && java -cp "${dir}" ${jobId}`;
        if (inputFilePath) {
            runCmd = `javac "${filePath}" && java -cp "${dir}" ${jobId} < "${inputFilePath}"`;
        }
        exec(runCmd, (error, stdout, stderr) => {
            const cleanStdout = (stdout || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trimEnd();
            const cleanStderr = (stderr || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trimEnd();

            setTimeout(() => { try { fs.unlinkSync(filePath); } catch (e) {
                console.log("Error deleting file:", e);
            } }, 20000);
            setTimeout(() => { try { fs.unlinkSync(classFile); } catch (e) {
                console.log("Error deleting class file:", e);
            } }, 20000);

            if (error) {
                return reject({ error: error.message, stderr: cleanStderr });
            }
            resolve({ stdout: cleanStdout, stderr: cleanStderr });
        });
    });
};

export default executeJava;
