import path from 'path';
import fs from 'fs';
import {v4 as uuid} from 'uuid';
const __dirname = path.resolve();
const dirCodes = path.join(__dirname,"user_codes");
if(!fs.existsSync(dirCodes)){
    fs.mkdirSync(dirCodes, {recursive: true});
}
const generateFile = (language, code) => {
    let fileName;
    if (language === 'java') {
        const match = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
        if (match) {
            fileName = `${match[1]}.java`;
        } else {
            fileName = `${uuid()}.java`;
        }
    } else {
        fileName = `${uuid()}.${language}`;
    }
    const filePath = path.join(dirCodes, fileName);
    fs.writeFileSync(filePath, code);
    return filePath;
}
export default generateFile;