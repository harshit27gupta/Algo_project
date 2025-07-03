import Problem from '../models/Problem.js';
import Submission from '../models/Submission.js';
import { StatusCodes } from 'http-status-codes';
import ErrorResponse from '../utils/errorResponse.js';
import mongoose from 'mongoose';
import axios from 'axios';

// Create a new problem
export const createProblem = async (req, res) => {
    const { title, description, difficulty, categories, timeLimit, memoryLimit, publicTestCases, hiddenTestCases } = req.body;
    // console.log(req.body);
    // Check if problem with same title exists
    const existingProblem = await Problem.findOne({ title });
    if (existingProblem) {
        throw new ErrorResponse('Problem with this title already exists', StatusCodes.BAD_REQUEST);
    }

    // Validate that at least one category is provided
    if (!categories || categories.length === 0) {
        throw new ErrorResponse('At least one category is required', StatusCodes.BAD_REQUEST);
    }

    const problem = await Problem.create({
        title,
        description,
        difficulty,
        categories,
        timeLimit,
        memoryLimit,
        publicTestCases,
        hiddenTestCases,
        author: req.user.id
    });

    res.status(StatusCodes.CREATED).json({
        success: true,
        data: problem
    });
};

// Get all problems with user status
export const getAllProblems = async (req, res) => {
    try {
        const startTime = Date.now();
        console.log(`📋 [GET_PROBLEMS] Request from user: ${req.user ? req.user.id : 'anonymous'} - IP: ${req.ip}`);
        
        // Get all published problems
        const problems = await Problem.find({ isPublished: true })
            .populate('author', 'fullName');

        // If user is authenticated, get their submission status for each problem
        let problemsWithStatus = problems;
        
        if (req.user) {
            const problemIds = problems.map(p => p._id);
            
            // Get user's submission status for all problems
            const userSubmissions = await Submission.aggregate([
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(req.user.id),
                        problem: { $in: problemIds }
                    }
                },
                {
                    $group: {
                        _id: '$problem',
                        hasAccepted: {
                            $max: {
                                $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0]
                            }
                        },
                        hasAttempted: { $sum: 1 },
                        latestStatus: { $first: '$status' }
                    }
                }
            ]);

            // Create a map of problem status
            const statusMap = {};
            userSubmissions.forEach(sub => {
                statusMap[sub._id.toString()] = {
                    hasAccepted: sub.hasAccepted === 1,
                    hasAttempted: sub.hasAttempted > 0,
                    latestStatus: sub.latestStatus
                };
            });

            // Add status to each problem
            problemsWithStatus = problems.map(problem => {
                const problemStatus = statusMap[problem._id.toString()];
                let userStatus = 'unsolved';
                
                if (problemStatus) {
                    if (problemStatus.hasAccepted) {
                        userStatus = 'solved';
                    } else if (problemStatus.hasAttempted) {
                        userStatus = 'attempted';
                    }
                }

                return {
                    ...problem.toObject(),
                    userStatus
                };
            });
        } else {
            // For unauthenticated users, add default status
            problemsWithStatus = problems.map(problem => ({
                ...problem.toObject(),
                userStatus: 'unsolved'
            }));
        }

        const endTime = Date.now();
        const responseTime = endTime - startTime;
        console.log(`✅ [GET_PROBLEMS] Returning ${problemsWithStatus.length} problems - Response time: ${responseTime}ms`);
        res.status(StatusCodes.OK).json({
            success: true,
            data: problemsWithStatus
        });
    } catch (error) {
        console.error('Error fetching problems:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to fetch problems'
        });
    }
};

// Get user's problem status
export const getUserProblemStatus = async (req, res) => {
    try {
        const { problemId } = req.params;
        
        if (!req.user) {
            return res.status(StatusCodes.OK).json({
                success: true,
                data: { status: 'unsolved' }
            });
        }

        const statusResult = await Submission.getUserProblemStatus(req.user.id, problemId);
        
        let status = 'unsolved';
        if (statusResult.length > 0) {
            const result = statusResult[0];
            if (result.hasAccepted) {
                status = 'solved';
            } else if (result.hasAttempted) {
                status = 'attempted';
            }
        }

        res.status(StatusCodes.OK).json({
            success: true,
            data: { status }
        });
    } catch (error) {
        console.error('Error fetching user problem status:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to fetch problem status'
        });
    }
};

// Get single problem by ID
export const getProblem = async (req, res) => {
    const { id } = req.params;

    const problem = await Problem.findById(id)
        .populate('author', 'fullName');

    if (!problem) {
        throw new ErrorResponse(`Problem with id ${id} not found`, StatusCodes.NOT_FOUND);
    }

    // If problem is not published, check if user is authorized to access it
    if (!problem.isPublished) {
        // If user is not authenticated, deny access
        if (!req.user) {
            throw new ErrorResponse('You must be logged in to view this unpublished problem.', StatusCodes.UNAUTHORIZED);
        }
        
        // If user is not the author or admin, deny access
        if (problem.author._id.toString() !== req.user.id && req.user.role !== 'admin') {
            throw new ErrorResponse('You do not have permission to view this problem.', StatusCodes.FORBIDDEN);
        }
    }

    res.status(StatusCodes.OK).json({
        success: true,
        data: problem
    });
};

// Update problem
export const updateProblem = async (req, res) => {
    const { id } = req.params;
    const { 
        title, 
        description, 
        difficulty, 
        categories, 
        timeLimit, 
        memoryLimit, 
        publicTestCases, 
        hiddenTestCases, 
        isPublished 
    } = req.body;

    const problem = await Problem.findById(id);

    if (!problem) {
        throw new ErrorResponse(`Problem with id ${id} not found`, StatusCodes.NOT_FOUND);
    }

    // Check if user is author or admin
    if (problem.author.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new ErrorResponse('You do not have permission to update this problem.', StatusCodes.FORBIDDEN);
    }

    // If title is being updated, check for duplicates
    if (title && title !== problem.title) {
        const existingProblem = await Problem.findOne({ title });
        if (existingProblem) {
            throw new ErrorResponse('Problem with this title already exists', StatusCodes.BAD_REQUEST);
        }
    }

    // Validate that at least one category is provided if categories are being updated
    if (categories && categories.length === 0) {
        throw new ErrorResponse('At least one category is required', StatusCodes.BAD_REQUEST);
    }

    // Update problem
    const updatedProblem = await Problem.findByIdAndUpdate(
        id,
        {
            title,
            description,
            difficulty,
            categories,
            timeLimit,
            memoryLimit,
            publicTestCases,
            hiddenTestCases,
            isPublished
        },
        { new: true, runValidators: true }
    ).populate('author', 'fullName');

    res.status(StatusCodes.OK).json({
        success: true,
        data: updatedProblem
    });
};

// Delete problem
export const deleteProblem = async (req, res) => {
    const { id } = req.params;

    const problem = await Problem.findById(id);

    if (!problem) {
        throw new ErrorResponse(`Problem with id ${id} not found`, StatusCodes.NOT_FOUND);
    }

    // Check if user is author or admin
    if (problem.author.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new ErrorResponse('You do not have permission to delete this problem.', StatusCodes.FORBIDDEN);
    }

    await problem.deleteOne();

    res.status(StatusCodes.OK).json({
        success: true,
        data: {}
    });
};

// Utility to enforce function signature and name for C++
function enforceCppSignature(userCode, requiredSignature, requiredName) {
  // More robust regex to match function definitions
  // This regex matches: return_type function_name(parameters) { ... }
  const functionRegex = /(\w+(?:<[^>]+>)?[\s\*&]+\w+)\s*\([^)]*\)\s*\{/;
  const match = userCode.match(functionRegex);
  
  if (match) {
    // Replace the function signature with the required one
    return userCode.replace(functionRegex, `${requiredSignature} {`);
  }
  
  // If no function found, just return the original code
  return userCode;
}

// Utility to enforce function signature and name for Java
function enforceJavaSignature(userCode, requiredSignature, requiredName) {
  // First, ensure the class name is "Solution"
  let modifiedCode = userCode;
  
  // Replace any existing class name with "Solution"
  modifiedCode = modifiedCode.replace(/public\s+class\s+[A-Za-z0-9_]+/, 'public class Solution');
  modifiedCode = modifiedCode.replace(/class\s+[A-Za-z0-9_]+/, 'class Solution');
  
  // Regex to match Java method definitions: public return_type method_name(parameters) { ... }
  const methodRegex = /public\s+\w+(?:<[^>]+>)?\s+\w+\s*\([^)]*\)\s*\{/;
  const match = modifiedCode.match(methodRegex);
  
  if (match) {
    // Replace the method signature with the required one
    return modifiedCode.replace(methodRegex, `${requiredSignature} {`);
  }
  
  // If no method found, just return the modified code with Solution class
  return modifiedCode;
}

// Utility to enforce function signature and name for C
function enforceCSignature(userCode, requiredSignature, requiredName) {
  // Regex to match C function definitions: return_type function_name(parameters) { ... }
  const functionRegex = /\w+\s+\w+\s*\([^)]*\)\s*\{/;
  const match = userCode.match(functionRegex);
  
  if (match) {
    // Replace the function signature with the required one
    return userCode.replace(functionRegex, `${requiredSignature} {`);
  }
  
  // If no function found, just return the original code
  return userCode;
}

// Helper to wrap user code for C++
function wrapCppCode(userCode, testInput, functionName) {
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

// Utility to clean up compiler error messages
function cleanCompilerError(stderr, language, originalUserCode = '') {
  if (!stderr) return { message: '', lines: [] };
  let USER_CODE_LINE_OFFSET = 3; // Default for C/C++
  let regex;
  
  if (language === 'java') {
    // Java: Main.java:5: error: missing return statement
    regex = /(?:.*[\\/])?([A-Za-z0-9_]+)\.java:(\d+):\s*(error|warning):\s*(.*)/;
    
    // Calculate offset based on the original user code structure
    let offset = 0;
    
    // If user code has a class, we inject main method into it (no additional lines)
    if (originalUserCode.includes('public class ')) {
      offset = 0;
    } else {
      // If no class, we wrap in Main class (adds some lines)
      offset = 2;
    }
    
    // If we added import java.util.*;, add 1 more line
    if (originalUserCode.includes('HashMap') || 
        originalUserCode.includes('Map<') ||
        originalUserCode.includes('ArrayList') || 
        originalUserCode.includes('List<') ||
        originalUserCode.includes('Arrays.') ||
        originalUserCode.includes('Collections.') ||
        originalUserCode.includes('PriorityQueue') ||
        originalUserCode.includes('HashSet') || 
        originalUserCode.includes('Set<') ||
        originalUserCode.includes('LinkedList') ||
        originalUserCode.includes('Queue<') ||
        originalUserCode.includes('Stack')) {
      // Check if java.util.* is already imported
      const hasUtilImport = originalUserCode.includes('import java.util.*;') || 
                           originalUserCode.includes('import java.util.*');
      if (!hasUtilImport) {
        offset += 1;
      }
    }
    
    USER_CODE_LINE_OFFSET = offset;
  } else {
    // C/C++
    regex = /(?:.*[\\/])?([A-Za-z0-9_\.]+):(\d+):(?:\d+:)?\s*(error|warning):\s*(.*)/;
  }
  
  const lines = stderr.split('\n');
  let formatted = [];
  let errorLines = [];
  for (let line of lines) {
    const match = line.match(regex);
    if (match) {
      let userLine = Math.max(1, parseInt(match[2], 10) - USER_CODE_LINE_OFFSET);
      let message = language === 'java'
        ? match[4].trim()
        : match[4].replace(/\s*\[[^\]]*\]$/, '').trim();
      formatted.push(`Line ${userLine}: error: ${message}`);
      errorLines.push(userLine);
    }
  }
  return {
    message: formatted.length ? formatted.join('\n') : stderr.trim(),
    lines: errorLines
  };
}

// Run code against public test cases
export const runCode = async (req, res) => {
    const { id } = req.params;
    const { code, language } = req.body;

    if (!code || !language) {
        throw new ErrorResponse('Code and language are required', StatusCodes.BAD_REQUEST);
    }

    const problem = await Problem.findById(id);

    if (!problem) {
        throw new ErrorResponse(`Problem with id ${id} not found`, StatusCodes.NOT_FOUND);
    }

    const supportedLanguages = ['cpp', 'c', 'java'];
    if (!supportedLanguages.includes(language)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Only C, C++, and Java are supported.'
        });
    }

    let requiredSignature, requiredName, wrapCodeFn;
    if (language === 'cpp') {
      requiredSignature = problem.functionSignature?.get('cpp') || 'vector<int> solution(vector<int>& nums, int target)';
      requiredName = problem.functionName || 'solution';
      wrapCodeFn = wrapCppCode;
    } else if (language === 'c') {
      requiredSignature = problem.functionSignature?.get('c') || 'int* solution(int* nums, int numsSize, int target, int* returnSize)';
      requiredName = problem.functionName || 'solution';
      wrapCodeFn = wrapCCode;
    } else if (language === 'java') {
      requiredSignature = problem.functionSignature?.get('java') || 'public int[] solution(int[] nums, int target)';
      requiredName = problem.functionName || 'solution';
      wrapCodeFn = wrapJavaCode; // You need to implement wrapJavaCode if not present
    }
    const COMPILER_URL = process.env.COMPILER_URL || 'http://localhost:8000/compile';
    const results = [];
    for (let i = 0; i < problem.publicTestCases.length; i++) {
        const testCase = problem.publicTestCases[i];
        let userCodeFixed = code;
        if (language === 'cpp') userCodeFixed = enforceCppSignature(code, requiredSignature, requiredName);
        if (language === 'java') {
          userCodeFixed = enforceJavaSignature(code, requiredSignature, requiredName);
          userCodeFixed = addJavaImports(userCodeFixed);
        }
        if (language === 'c') userCodeFixed = enforceCSignature(code, requiredSignature, requiredName);
        const wrappedCode = wrapCodeFn(userCodeFixed, testCase.input, requiredName);
        
        // Debug: Log the wrapped code for C
        if (language === 'c') {
          console.log('WRAPPED C CODE:');
          console.log(wrappedCode);
        }
        
        try {
            const compileRes = await axios.post(COMPILER_URL, {
                language,
                code: wrappedCode,
                input: ''
            }, { timeout: 10000 });
            console.log('RAW COMPILER STDERR:', compileRes.data.stderr);
            const errorObj = cleanCompilerError(compileRes.data.stderr || '', language, code);
            let output = (compileRes.data.stdout || '').trim();
            if (output.endsWith(',')) output = output.slice(0, -1);
            const expected = testCase.output.trim();
            results.push({
                id: i,
                input: testCase.input,
                expected,
                output,
                status: output === expected ? 'passed' : 'failed',
                stderr: errorObj.message,
                errorLines: errorObj.lines,
                execTime: compileRes.data.execTime || null
            });
        } catch (err) {
            console.log('RAW COMPILER ERROR:', err);
            console.log('RAW COMPILER ERROR RESPONSE:', err.response?.data);
            console.log('RAW COMPILER ERROR STDERR:', err.response?.data?.stderr || err.message);
            // Extract error message properly
            let errorMessage = '';
            if (err.response?.data?.stderr) {
                errorMessage = typeof err.response.data.stderr === 'string' 
                    ? err.response.data.stderr 
                    : JSON.stringify(err.response.data.stderr);
            } else if (err.message) {
                errorMessage = err.message;
            } else {
                errorMessage = 'Unknown compilation error';
            }
            
            const errorObj = cleanCompilerError(errorMessage, language, code);
            results.push({
                id: i,
                input: testCase.input,
                expected: testCase.output.trim(),
                output: '',
                status: 'error',
                stderr: errorObj.message,
                errorLines: errorObj.lines,
                execTime: null
            });
        }
    }

    res.status(StatusCodes.OK).json({
        success: true,
        data: results
    });
};

// Submit solution for a problem
export const submitSolution = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, language } = req.body;

        const problem = await Problem.findById(id);

        if (!problem) {
            throw new ErrorResponse(`Problem with id ${id} not found`, StatusCodes.NOT_FOUND);
        }

        // Validate language
        const supportedLanguages = ['cpp', 'c', 'java'];
        if (!supportedLanguages.includes(language)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Only C, C++, and Java are supported for submissions.'
            });
        }

        // Get all test cases (public + hidden)
        const allTestCases = [...problem.publicTestCases, ...problem.hiddenTestCases];
        const totalTestCases = allTestCases.length;
        
        if (totalTestCases === 0) {
            throw new ErrorResponse('No test cases found for this problem', StatusCodes.BAD_REQUEST);
        }

        let requiredSignature, requiredName, wrapCodeFn;
        if (language === 'cpp') {
            requiredSignature = problem.functionSignature?.get('cpp') || 'vector<int> solution(vector<int>& nums, int target)';
            requiredName = problem.functionName || 'solution';
            wrapCodeFn = wrapCppCode;
        } else if (language === 'c') {
            requiredSignature = problem.functionSignature?.get('c') || 'int* solution(int* nums, int numsSize, int target, int* returnSize)';
            requiredName = problem.functionName || 'solution';
            wrapCodeFn = wrapCCode;
        } else if (language === 'java') {
            requiredSignature = problem.functionSignature?.get('java') || 'public int[] solution(int[] nums, int target)';
            requiredName = problem.functionName || 'solution';
            wrapCodeFn = wrapJavaCode;
        }

        const COMPILER_URL = process.env.COMPILER_URL || 'http://localhost:8000/compile';
        const results = [];
        let totalExecutionTime = 0;
        let totalMemoryUsed = 0;
        let testCasesPassed = 0;
        let status = 'accepted';
        let errorMessage = '';

        // 1. Try to compile the code first (using the first test case input or empty input)
        let compileCheckInput = '';
        if (allTestCases.length > 0) {
            compileCheckInput = allTestCases[0].input || '';
        }
        let compileCheckCode = code;
        if (language === 'cpp') compileCheckCode = enforceCppSignature(code, requiredSignature, requiredName);
        if (language === 'java') {
            compileCheckCode = enforceJavaSignature(code, requiredSignature, requiredName);
            compileCheckCode = addJavaImports(compileCheckCode);
        }
        if (language === 'c') compileCheckCode = enforceCSignature(code, requiredSignature, requiredName);
        const compileCheckWrapped = wrapCodeFn(compileCheckCode, compileCheckInput, requiredName);
        try {
            const compileRes = await axios.post(COMPILER_URL, {
                language,
                code: compileCheckWrapped,
                input: ''
            }, { timeout: 10000 });
            if (compileRes.data.stderr && compileRes.data.stderr.trim() !== '') {
                // Compilation error, return immediately
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'Compilation Error',
                    status: 'compilation_error',
                    error: compileRes.data.stderr
                });
            }
        } catch (err) {
            // Compilation error, return immediately
            let errorMessage = '';
            if (err.response?.data?.stderr) {
                errorMessage = typeof err.response.data.stderr === 'string' 
                    ? err.response.data.stderr 
                    : JSON.stringify(err.response.data.stderr);
            } else if (err.message) {
                errorMessage = err.message;
            } else {
                errorMessage = 'Unknown compilation error';
            }
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Compilation Error',
                status: 'compilation_error',
                error: errorMessage
            });
        }
        // 2. If compilation succeeds, proceed as before

        // Execute against all test cases
        for (let i = 0; i < allTestCases.length; i++) {
            const testCase = allTestCases[i];
            
            let userCodeFixed = code;
            if (language === 'cpp') userCodeFixed = enforceCppSignature(code, requiredSignature, requiredName);
            if (language === 'java') {
                userCodeFixed = enforceJavaSignature(code, requiredSignature, requiredName);
                userCodeFixed = addJavaImports(userCodeFixed);
            }
            if (language === 'c') userCodeFixed = enforceCSignature(code, requiredSignature, requiredName);
            
            const wrappedCode = wrapCodeFn(userCodeFixed, testCase.input, requiredName);
            
            try {
                const compileRes = await axios.post(COMPILER_URL, {
                    language,
                    code: wrappedCode,
                    input: ''
                }, { timeout: 10000 });
                const execTime = compileRes.data.execTime || 0;
                totalExecutionTime += execTime;
                
                const errorObj = cleanCompilerError(compileRes.data.stderr || '', language, code);
                let output = (compileRes.data.stdout || '').trim();
                if (output.endsWith(',')) output = output.slice(0, -1);
                const expected = testCase.output.trim();
                
                const testResult = {
                    id: i,
                    input: testCase.input,
                    expected,
                    output,
                    status: output === expected ? 'passed' : 'failed',
                    stderr: errorObj.message,
                    errorLines: errorObj.lines,
                    execTime
                };
                
                results.push(testResult);
                
                // Check for compilation or runtime errors
                if (compileRes.data.stderr && compileRes.data.stderr.trim() !== '') {
                    status = 'runtime_error';
                    errorMessage = compileRes.data.stderr;
                    // Save runtime error submission
                    await Submission.create({
                        user: req.user.id,
                        problem: id,
                        code,
                        language,
                        status,
                        executionTime: totalExecutionTime,
                        memoryUsed: totalMemoryUsed,
                        testCasesPassed,
                        totalTestCases,
                        errorMessage: errorMessage || 'Runtime Error'
                    });
                    return res.status(StatusCodes.OK).json({
                        success: false,
                        message: 'Runtime Error',
                        status: 'runtime_error',
                        error: errorMessage,
                        testCasesPassed,
                        totalTestCases
                    });
                }
                
                // Check if test case passed
                if (testResult.status === 'passed') {
                    testCasesPassed++;
                } else {
                    status = 'wrong_answer';
                    // Save wrong answer submission
                    await Submission.create({
                        user: req.user.id,
                        problem: id,
                        code,
                        language,
                        status,
                        executionTime: totalExecutionTime,
                        memoryUsed: totalMemoryUsed,
                        testCasesPassed,
                        totalTestCases,
                        errorMessage: errorMessage || 'Wrong Answer'
                    });
                    return res.status(StatusCodes.OK).json({
                        success: false,
                        message: 'Wrong Answer',
                        status: 'wrong_answer',
                        data: {
                            failedCase: {
                                index: i + 1,
                                input: testCase.input,
                                expected: expected,
                                output: output
                            },
                            testCasesPassed,
                            totalTestCases
                        }
                    });
                }
                
                // Check time limit
                if (execTime > problem.timeLimit) {
                    status = 'time_limit_exceeded';
                    break;
                }
                
                // Simulate memory usage (in a real system, you'd measure actual memory)
                const memoryUsed = Math.floor(Math.random() * 50) + 10; // 10-60MB
                totalMemoryUsed = Math.max(totalMemoryUsed, memoryUsed);
                
            } catch (error) {
                console.error('Error executing test case:', error);
                status = 'runtime_error';
                errorMessage = error.message || 'Execution failed';
                // Save runtime error submission
                await Submission.create({
                    user: req.user.id,
                    problem: id,
                    code,
                    language,
                    status,
                    executionTime: totalExecutionTime,
                    memoryUsed: totalMemoryUsed,
                    testCasesPassed,
                    totalTestCases,
                    errorMessage: errorMessage || 'Execution failed'
                });
                break;
            }
        }

        // Create submission record
        const submission = await Submission.create({
            user: req.user.id,
            problem: id,
            code,
            language,
            status,
            executionTime: totalExecutionTime,
            memoryUsed: totalMemoryUsed,
            testCasesPassed,
            totalTestCases,
            errorMessage: errorMessage || 'Execution failed'
        });

        // Update problem statistics
        problem.totalSubmissions += 1;
        if (status === 'accepted') {
            problem.successfulSubmissions += 1;
        }
        await problem.save();

        if (status === 'runtime_error') {
            return res.status(StatusCodes.OK).json({
                success: false,
                message: 'Runtime Error',
                status: 'runtime_error',
                error: errorMessage,
                testCasesPassed,
                totalTestCases
            });
        }

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Solution submitted successfully',
            data: {
                submissionId: submission._id,
                status,
                executionTime: totalExecutionTime,
                memoryUsed: totalMemoryUsed,
                testCasesPassed,
                totalTestCases,
                successRate: Math.round((testCasesPassed / totalTestCases) * 100),
                errorMessage: errorMessage || undefined
            }
        });
    } catch (error) {
        console.error('Error submitting solution:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to submit solution'
        });
    }
};
export const getProblemStats = async (req, res) => {
    const stats = await Problem.aggregate([
        {
            $group: {
                _id: '$difficulty',
                count: { $sum: 1 },
                avgRating: { $avg: '$rating' },
                avgAcceptanceRate: {
                    $avg: {
                        $cond: [
                            { $eq: ['$totalSubmissions', 0] },
                            0,
                            { $multiply: [{ $divide: ['$successfulSubmissions', '$totalSubmissions'] }, 100] }
                        ]
                    }
                }
            }
        }
    ]);

    // Get category distribution
    const categoryStats = await Problem.aggregate([
        { $unwind: '$categories' },
        {
            $group: {
                _id: '$categories',
                count: { $sum: 1 }
            }
        }
    ]);

    res.status(StatusCodes.OK).json({
        success: true,
        data: {
            difficultyStats: stats,
            categoryStats
        }
    });
};

function wrapJavaCode(userCode, testInput, functionName) {
  // Parse testInput for nums and target
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

  // Check if user code already has a class definition
  const hasClass = userCode.includes('public class ') || userCode.includes('class ');
  
  if (hasClass) {
    // If class exists, replace the class name with "Solution" and add main method
    let modifiedCode = userCode.replace(/public\s+class\s+[A-Za-z0-9_]+/, 'public class Solution');
    modifiedCode = modifiedCode.replace(/class\s+[A-Za-z0-9_]+/, 'class Solution');
    
    // Insert main method before the closing brace of the class
    const lastBraceIndex = modifiedCode.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
      const mainMethod = `
    public static void main(String[] args) {
        ${numsLine}
        ${targetLine}
        Solution solution = new Solution();
        int[] result = solution.${functionName}(nums, target);
        System.out.print("[");
        for (int i = 0; i < result.length; i++) {
            System.out.print(result[i]);
            if (i + 1 < result.length) System.out.print(",");
        }
        System.out.println("]");
    }`;
      return modifiedCode.slice(0, lastBraceIndex) + mainMethod + '\n' + modifiedCode.slice(lastBraceIndex);
    }
    return modifiedCode;
  } else {
    // If no class, wrap the code in a Solution class
    const mainMethod = `
    public static void main(String[] args) {
        ${numsLine}
        ${targetLine}
        Solution solution = new Solution();
        int[] result = solution.${functionName}(nums, target);
        System.out.print("[");
        for (int i = 0; i < result.length; i++) {
            System.out.print(result[i]);
            if (i + 1 < result.length) System.out.print(",");
        }
        System.out.println("]");
    }`;
    
    return `public class Solution {
    ${userCode}
    ${mainMethod}
}`;
  }
}

function wrapCCode(userCode, testInput, functionName) {
  // Parse testInput for nums and target
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

  return `#include <stdio.h>
#include <stdlib.h>
${userCode}

int main() {
    ${numsLine}
    ${targetLine}
    ${returnSizeLine}
    int* result = ${functionName}(nums, ${numsSize}, target, &returnSize);
    printf("[");
    for (int i = 0; i < returnSize; i++) {
        printf("%d", result[i]);
        if (i + 1 < returnSize) printf(",");
    }
    printf("]\\n");
    free(result);
    return 0;
}`;
}

// Utility to add necessary imports for Java code
function addJavaImports(userCode) {
  // Check if code uses any Java collections or utilities
  const usesCollections = userCode.includes('HashMap') || 
                         userCode.includes('Map<') ||
                         userCode.includes('ArrayList') || 
                         userCode.includes('List<') ||
                         userCode.includes('Arrays.') ||
                         userCode.includes('Collections.') ||
                         userCode.includes('PriorityQueue') ||
                         userCode.includes('HashSet') || 
                         userCode.includes('Set<') ||
                         userCode.includes('LinkedList') ||
                         userCode.includes('Queue<') ||
                         userCode.includes('Stack');
  
  // Check if java.util.* is already imported
  const hasUtilImport = userCode.includes('import java.util.*;') || 
                       userCode.includes('import java.util.*');
  
  if (usesCollections && !hasUtilImport) {
    return 'import java.util.*;\n' + userCode;
  }
  
  return userCode;
} 