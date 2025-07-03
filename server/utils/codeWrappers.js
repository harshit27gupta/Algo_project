export function wrapCppCode(userCode, testInput, functionName) {
  let inputLines = [];
  let matches = [...testInput.matchAll(/(\w+)\s*=\s*(\[[^\]]*\]|\S+)/g)];
  for (const match of matches) {
    let varName = match[1];
    let value = match[2].trim();
    if (value.startsWith('[')) {
      const arr = value.replace(/[\[\]\s]/g, '').split(',').filter(Boolean).join(',');
      inputLines.push(`vector<int> ${varName} = {${arr}};`);
    } else {
      inputLines.push(`int ${varName} = ${value};`);
    }
  }
  let callLine = `auto result = ${functionName}(nums, target);\n`;
  callLine += 'cout << "[";\n';
  callLine += 'for (size_t i = 0; i < result.size(); ++i) {\n';
  callLine += '  cout << result[i];\n';
  callLine += '  if (i + 1 < result.size()) cout << ",";\n';
  callLine += '}\n';
  callLine += 'cout << "]" << endl;';
  return `#include <iostream>\n#include <vector>\nusing namespace std;\n${userCode}\nint main() {\n${inputLines.join('\n')}\n${callLine}\nreturn 0;\n}`;
}

export function wrapJavaCode(userCode, testInput, functionName) {
  let numsLine = '';
  let targetLine = '';
  const numsMatch = testInput.match(/nums\s*=\s*(\[[^\]]*\])/);
  const targetMatch = testInput.match(/target\s*=\s*([^\s,]+)/);
  if (numsMatch) {
    const arr = numsMatch[1].replace(/[\[\]\s]/g, '').split(',').filter(Boolean).join(',');
    numsLine = `int[] nums = new int[]{${arr}};`;
  }
  if (targetMatch) {
    targetLine = `int target = ${targetMatch[1]};`;
  }
  const hasClass = userCode.includes('public class ') || userCode.includes('class ');
  if (hasClass) {
    let modifiedCode = userCode.replace(/public\s+class\s+[A-Za-z0-9_]+/, 'public class Solution');
    modifiedCode = modifiedCode.replace(/class\s+[A-Za-z0-9_]+/, 'class Solution');
    const lastBraceIndex = modifiedCode.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      const mainMethod = `\n    public static void main(String[] args) {\n        ${numsLine}\n        ${targetLine}\n        Solution solution = new Solution();\n        int[] result = solution.${functionName}(nums, target);\n        System.out.print("[");\n        for (int i = 0; i < result.length; i++) {\n            System.out.print(result[i]);\n            if (i + 1 < result.length) System.out.print(",");\n        }\n        System.out.println("]");\n    }`;
      return modifiedCode.slice(0, lastBraceIndex) + mainMethod + '\n' + modifiedCode.slice(lastBraceIndex);
    }
    return modifiedCode;
  } else {
    const mainMethod = `\n    public static void main(String[] args) {\n        ${numsLine}\n        ${targetLine}\n        Solution solution = new Solution();\n        int[] result = solution.${functionName}(nums, target);\n        System.out.print("[");\n        for (int i = 0; i < result.length; i++) {\n            System.out.print(result[i]);\n            if (i + 1 < result.length) System.out.print(",");\n        }\n        System.out.println("]");\n    }`;
    return `public class Solution {\n    ${userCode}\n    ${mainMethod}\n}`;
  }
}

export function wrapCCode(userCode, testInput, functionName) {
  let numsLine = '';
  let targetLine = '';
  let returnSizeLine = '';
  let numsSize = 0;
  const numsMatch = testInput.match(/nums\s*=\s*(\[[^\]]*\])/);
  const targetMatch = testInput.match(/target\s*=\s*([^\s,]+)/);
  if (numsMatch) {
    const arr = numsMatch[1].replace(/[\[\]\s]/g, '').split(',').filter(Boolean);
    numsSize = arr.length;
    numsLine = `int nums[] = {${arr.join(',')}};`;
  }
  if (targetMatch) {
    targetLine = `int target = ${targetMatch[1]};`;
  }
  returnSizeLine = `int returnSize;`;
  return `#include <stdio.h>\n#include <stdlib.h>\n${userCode}\n\nint main() {\n    ${numsLine}\n    ${targetLine}\n    ${returnSizeLine}\n    int* result = ${functionName}(nums, ${numsSize}, target, &returnSize);\n    printf("[");\n    for (int i = 0; i < returnSize; i++) {\n        printf("%d", result[i]);\n        if (i + 1 < returnSize) printf(",");\n    }\n    printf("]\\n");\n    free(result);\n    return 0;\n}`;
} 