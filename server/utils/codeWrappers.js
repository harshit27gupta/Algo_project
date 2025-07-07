export function wrapCppCode(userCode, testInput, functionName, functionSignature) {
  // Extract return type from function signature
  const returnTypeMatch = functionSignature?.match(/^(\w+(?:<[^>]+>)?)\s+/) || ['', 'int'];
  const resultType = returnTypeMatch[1];

  // Parse input parameters
  let inputLines = [];
  let params = [];
  
  // Handle different input formats
  const matches = [...testInput.matchAll(/(\w+)\s*=\s*(\[[^\]]*\]|"[^"]*"|\S+)/g)];
  
  for (const match of matches) {
    const varName = match[1];
    let value = match[2].trim();
    params.push(varName);
    
    if (value.startsWith('[')) {
      // Array input
      const arr = value.replace(/[\[\]\s]/g, '').split(',').filter(Boolean);
      if (arr.length > 0 && arr[0].includes('"')) {
        // String array
        const stringArr = value.match(/"([^"]*)"/g) || [];
        inputLines.push(`vector<string> ${varName} = {${stringArr.join(',')}};`);
      } else {
        // Integer array
        inputLines.push(`vector<int> ${varName} = {${arr.join(',')}};`);
      }
    } else if (value.startsWith('"')) {
      // String input
      inputLines.push(`string ${varName} = ${value};`);
    } else {
      // Numeric or boolean input
      if (value === 'true' || value === 'false') {
        inputLines.push(`bool ${varName} = ${value};`);
      } else {
        inputLines.push(`int ${varName} = ${value};`);
      }
    }
  }

  // Generate appropriate print statement based on return type
  let printResult = '';
  if (resultType === 'vector<int>') {
    printResult = `cout << "[";\n    for (size_t i = 0; i < result.size(); ++i) {\n        cout << result[i];\n        if (i + 1 < result.size()) cout << ",";\n    }\n    cout << "]" << endl;`;
  } else if (resultType === 'vector<vector<int>>') {
    printResult = `cout << "[";\n    for (size_t i = 0; i < result.size(); ++i) {\n        cout << "[";\n        for (size_t j = 0; j < result[i].size(); ++j) {\n            cout << result[i][j];\n            if (j + 1 < result[i].size()) cout << ",";\n        }\n        cout << "]";\n        if (i + 1 < result.size()) cout << ",";\n    }\n    cout << "]" << endl;`;
  } else if (resultType === 'string') {
    printResult = `cout << "\\"" << result << "\\"" << endl;`;
  } else if (resultType === 'bool') {
    printResult = `cout << (result ? "true" : "false") << endl;`;
  } else {
    printResult = `cout << result << endl;`;
  }

  const functionCall = `auto result = ${functionName}(${params.join(', ')});`;
  
  return `#include <iostream>
#include <vector>
#include <string>
using namespace std;

${userCode}

int main() {
    ${inputLines.join('\n    ')}
    ${functionCall}
    ${printResult}
    return 0;
}`;
}

export function wrapJavaCode(userCode, testInput, functionName, functionSignature) {
  // Extract return type from function signature
  const returnTypeMatch = functionSignature?.match(/^public\s+(\w+(?:<[^>]+>)?)\s+/) || ['', 'int'];
  const resultType = returnTypeMatch[1];

  // Parse input parameters
  let inputLines = [];
  let params = [];
  
  // Handle different input formats
  const matches = [...testInput.matchAll(/(\w+)\s*=\s*(\[[^\]]*\]|"[^"]*"|\S+)/g)];
  
  for (const match of matches) {
    const varName = match[1];
    let value = match[2].trim();
    params.push(varName);
    
    if (value.startsWith('[')) {
      // Array input
      const arr = value.replace(/[\[\]\s]/g, '').split(',').filter(Boolean);
      if (arr.length > 0 && arr[0].includes('"')) {
        // String array
        const stringArr = value.match(/"([^"]*)"/g) || [];
        inputLines.push(`String[] ${varName} = {${stringArr.join(',')}};`);
      } else {
        // Integer array
        inputLines.push(`int[] ${varName} = {${arr.join(',')}};`);
      }
    } else if (value.startsWith('"')) {
      // String input
      inputLines.push(`String ${varName} = ${value};`);
    } else {
      // Numeric or boolean input
      if (value === 'true' || value === 'false') {
        inputLines.push(`boolean ${varName} = ${value};`);
      } else {
        inputLines.push(`int ${varName} = ${value};`);
      }
    }
  }

  // Generate appropriate print statement based on return type
  let printResult = '';
  if (resultType === 'int[]') {
    printResult = `System.out.print("[");\n        for (int i = 0; i < result.length; i++) {\n            System.out.print(result[i]);\n            if (i + 1 < result.length) System.out.print(",");\n        }\n        System.out.println("]");`;
  } else if (resultType === 'List<List<Integer>>') {
    printResult = `System.out.println(result);`;
  } else if (resultType === 'String') {
    printResult = `System.out.println(result);`;
  } else if (resultType === 'boolean') {
    printResult = `System.out.println(result);`;
  } else if (resultType === 'int') {
    printResult = `System.out.println(result);`;
  } else {
    printResult = `System.out.println(result);`;
  }

  const mainMethod = `\n    public static void main(String[] args) {\n        ${inputLines.join('\n        ')}\n        Solution solution = new Solution();\n        ${resultType} result = solution.${functionName}(${params.join(', ')});\n        ${printResult}\n    }`;

  // Insert main and helpers into user code
  const hasClass = userCode.includes('public class ') || userCode.includes('class ');
  if (hasClass) {
    let modifiedCode = userCode.replace(/public\s+class\s+[A-Za-z0-9_]+/, 'public class Solution');
    modifiedCode = modifiedCode.replace(/class\s+[A-Za-z0-9_]+/, 'class Solution');
    const lastBraceIndex = modifiedCode.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      return modifiedCode.slice(0, lastBraceIndex) + mainMethod + '\n' + modifiedCode.slice(lastBraceIndex);
    }
    return modifiedCode;
  } else {
    return `public class Solution {\n    ${userCode}\n    ${mainMethod}\n}`;
  }
}

export function wrapCCode(userCode, testInput, functionName, functionSignature) {
  // Extract return type from function signature
  const returnTypeMatch = functionSignature?.match(/^(\w+(?:\*)?)\s+/) || ['', 'int'];
  const resultType = returnTypeMatch[1];

  // Parse input parameters
  let inputLines = [];
  let params = [];
  let returnSizeLine = '';
  let returnSizeParam = '';
  
  // Handle different input formats
  const matches = [...testInput.matchAll(/(\w+)\s*=\s*(\[[^\]]*\]|"[^"]*"|\S+)/g)];
  
  for (const match of matches) {
    const varName = match[1];
    let value = match[2].trim();
    
    if (value.startsWith('[')) {
      // Array input
      const arr = value.replace(/[\[\]\s]/g, '').split(',').filter(Boolean);
      if (arr.length > 0 && arr[0].includes('"')) {
        // String array - C doesn't handle this well, but we'll try
        const stringArr = value.match(/"([^"]*)"/g) || [];
        inputLines.push(`char* ${varName}[] = {${stringArr.join(',')}};`);
        inputLines.push(`int ${varName}Size = ${stringArr.length};`);
        params.push(varName, `${varName}Size`);
      } else {
        // Integer array
        inputLines.push(`int ${varName}[] = {${arr.join(',')}};`);
        inputLines.push(`int ${varName}Size = ${arr.length};`);
        params.push(varName, `${varName}Size`);
      }
    } else if (value.startsWith('"')) {
      // String input
      inputLines.push(`char* ${varName} = ${value};`);
      params.push(varName);
    } else {
      // Numeric input
      if (value === 'true' || value === 'false') {
        inputLines.push(`bool ${varName} = ${value};`);
      } else {
        inputLines.push(`int ${varName} = ${value};`);
      }
      params.push(varName);
    }
  }

  // Add returnSize parameter for array return types
  if (resultType === 'int*' || resultType === 'char*') {
    returnSizeLine = 'int returnSize;';
    returnSizeParam = ', &returnSize';
  }

  // Generate appropriate print statement based on return type
  let printResult = '';
  if (resultType === 'int*') {
    printResult = `printf("[");\n    for (int i = 0; i < returnSize; i++) {\n        printf("%d", result[i]);\n        if (i + 1 < returnSize) printf(",");\n    }\n    printf("]\\n");\n    free(result);`;
  } else if (resultType === 'char*') {
    printResult = `printf("\\"%s\\"\\n", result);\n    free(result);`;
  } else if (resultType === 'bool') {
    printResult = `printf("%s\\n", result ? "true" : "false");`;
  } else {
    printResult = `printf("%d\\n", result);`;
  }

  const functionCall = `${resultType} result = ${functionName}(${params.join(', ')}${returnSizeParam});`;
  
  return `#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

${userCode}

int main() {
    ${inputLines.join('\n    ')}
    ${returnSizeLine}
    ${functionCall}
    ${printResult}
    return 0;
}`;
} 