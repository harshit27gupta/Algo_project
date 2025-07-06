import Problem from '../models/Problem.js';
import Submission from '../models/Submission.js';
import { StatusCodes } from 'http-status-codes';
import ErrorResponse from '../utils/errorResponse.js';
import mongoose from 'mongoose';
import axios from 'axios';

export const createProblem = async (req, res) => {
    const { title, description, difficulty, categories, timeLimit, memoryLimit, publicTestCases, hiddenTestCases } = req.body;

    const existingProblem = await Problem.findOne({ title });
    if (existingProblem) {
        throw new ErrorResponse('Problem with this title already exists', StatusCodes.BAD_REQUEST);
    }

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

export const getAllProblems = async (req, res) => {
  console.log('LOADED: getAllProblems');
    try {
        const startTime = Date.now();
        console.log(`📋 [GET_PROBLEMS] Request from user: ${req.user ? req.user.id : 'anonymous'} - IP: ${req.ip}`);
        
        const problems = await Problem.find({ isPublished: true })
            .populate('author', 'fullName');

        let problemsWithStatus = problems;
        
        if (req.user) {
            const problemIds = problems.map(p => p._id);
            
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

            const statusMap = {};
            userSubmissions.forEach(sub => {
                statusMap[sub._id.toString()] = {
                    hasAccepted: sub.hasAccepted === 1,
                    hasAttempted: sub.hasAttempted > 0,
                    latestStatus: sub.latestStatus
                };
            });

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

export const getProblem = async (req, res) => {
    const { id } = req.params;

    const problem = await Problem.findById(id)
        .populate('author', 'fullName');

    if (!problem) {
        throw new ErrorResponse(`Problem with id ${id} not found`, StatusCodes.NOT_FOUND);
    }

    if (!problem.isPublished) {
        if (!req.user) {
            throw new ErrorResponse('You must be logged in to view this unpublished problem.', StatusCodes.UNAUTHORIZED);
        }
        
        if (problem.author._id.toString() !== req.user.id && req.user.role !== 'admin') {
            throw new ErrorResponse('You do not have permission to view this problem.', StatusCodes.FORBIDDEN);
        }
    }

    res.status(StatusCodes.OK).json({
        success: true,
        data: problem
    });
};

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

    if (problem.author.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new ErrorResponse('You do not have permission to update this problem.', StatusCodes.FORBIDDEN);
    }

    if (title && title !== problem.title) {
        const existingProblem = await Problem.findOne({ title });
        if (existingProblem) {
            throw new ErrorResponse('Problem with this title already exists', StatusCodes.BAD_REQUEST);
        }
    }

    if (categories && categories.length === 0) {
        throw new ErrorResponse('At least one category is required', StatusCodes.BAD_REQUEST);
    }

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

export const deleteProblem = async (req, res) => {
    const { id } = req.params;

    const problem = await Problem.findById(id);

    if (!problem) {
        throw new ErrorResponse(`Problem with id ${id} not found`, StatusCodes.NOT_FOUND);
    }

    if (problem.author.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new ErrorResponse('You do not have permission to delete this problem.', StatusCodes.FORBIDDEN);
    }

    await problem.deleteOne();

    res.status(StatusCodes.OK).json({
        success: true,
        data: {}
    });
};

function enforceCppSignature(userCode, requiredSignature, requiredName) {
  const functionRegex = /(\w+(?:<[^>]+>)?[\s\*&]+\w+)\s*\([^)]*\)\s*\{/;
  const match = userCode.match(functionRegex);
  
  if (match) {      
    return userCode.replace(functionRegex, `${requiredSignature} {`);
  }
  
  return userCode;
}

function enforceJavaSignature(userCode, requiredSignature, requiredName) {
  let modifiedCode = userCode;
  
  modifiedCode = modifiedCode.replace(/public\s+class\s+[A-Za-z0-9_]+/, 'public class Solution');
  modifiedCode = modifiedCode.replace(/class\s+[A-Za-z0-9_]+/, 'class Solution');
  
  const methodRegex = /public\s+\w+(?:<[^>]+>)?\s+\w+\s*\([^)]*\)\s*\{/;
  const match = modifiedCode.match(methodRegex);
  
  if (match) {
    return modifiedCode.replace(methodRegex, `${requiredSignature} {`);
  }
  
  return modifiedCode;
}

function enforceCSignature(userCode, requiredSignature, requiredName) {
  const functionRegex = /\w+\s+\w+\s*\([^)]*\)\s*\{/;
  const match = userCode.match(functionRegex);
  
  if (match) {
    return userCode.replace(functionRegex, `${requiredSignature} {`);
  }
  
  return userCode;
}

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

function cleanCompilerError(stderr, language, originalUserCode = '') {
  if (!stderr) return { message: '', lines: [] };
  let USER_CODE_LINE_OFFSET = 3;
  let regex;
  
  if (language === 'java') {
    regex = /(?:.*[\\/])?([A-Za-z0-9_]+)\.java:(\d+):\s*(error|warning):\s*(.*)/;
    
    let offset = 0;
    
    if (originalUserCode.includes('public class ')) {
      offset = 0;
    } else {
      offset = 2;
    }
    
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
      const hasUtilImport = originalUserCode.includes('import java.util.*;') || 
                           originalUserCode.includes('import java.util.*');
      if (!hasUtilImport) {
        offset += 1;
      }
    }
    
    USER_CODE_LINE_OFFSET = offset;
  } else {
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

export const runCode = async (req, res) => {
  console.log('LOADED: problem.js');
  try {
    const { id } = req.params;
    const { code, language, customInput } = req.body;
    console.log('[CustomRun] Received request:', { id, code, language, customInput });
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Please log in to use this feature.'
      });
    }

    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Problem not found'
      });
    }

    const requiredSignature = problem.functionSignature[language];
    const requiredName = problem.functionName;

    let userCodeFixed = code;
    if (language === 'cpp') userCodeFixed = enforceCppSignature(code, requiredSignature, requiredName);
    if (language === 'java') {
      userCodeFixed = enforceJavaSignature(code, requiredSignature, requiredName);
      userCodeFixed = addJavaImports(userCodeFixed);
    }
    if (language === 'c') userCodeFixed = enforceCSignature(code, requiredSignature, requiredName);

    const wrapCodeFn = getWrapCodeFunction(language);
    const COMPILER_URL = process.env.COMPILER_URL || 'http://localhost:8000/compile';

    // Handle custom test case ONLY if customInput is present and non-empty
    if (customInput && customInput.trim()) {
      const wrappedCode = wrapCodeFn(userCodeFixed, customInput, requiredName);
      try {
        const compileRes = await axios.post(COMPILER_URL, {
          language,
          code: wrappedCode,
          input: ''
        }, { timeout: 10000 });
        const errorObj = cleanCompilerError(compileRes.data.stderr || '', language, code);
        let output = (compileRes.data.stdout || '').trim();
        if (output.endsWith(',')) output = output.slice(0, -1);
        console.log('[CustomRun] Compiler stdout:', compileRes.data.stdout);
        console.log('[CustomRun] Compiler stderr:', compileRes.data.stderr);
        console.log('[CustomRun] Cleaned error:', errorObj.message);
        console.log('[CustomRun] Final output sent to client:', output);
        return res.status(StatusCodes.OK).json({
          success: true,
          data: {
            input: customInput,
            output,
            stderr: errorObj.message,
            execTime: compileRes.data.execTime || null
          }
        });
      } catch (err) {
        console.log('[CustomRun] Compiler error:', err?.response?.data || err.message);
        return res.status(StatusCodes.OK).json({
          success: false,
          data: {
            input: customInput,
            output: '',
            stderr: err?.response?.data || err.message,
            execTime: null
          }
        });
      }
    }

    // Otherwise, run all public test cases
    let results = [];
    for (let i = 0; i < problem.publicTestCases.length; i++) {
      const testCase = problem.publicTestCases[i];
      console.log('[CustomRun] Running public test case:', testCase);
      const wrappedCode = wrapCodeFn(userCodeFixed, testCase.input, requiredName);
      try {
        const compileRes = await axios.post(COMPILER_URL, {
          language,
          code: wrappedCode,
          input: ''
        }, { timeout: 10000 });
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
        results.push({
          id: i,
          input: testCase.input,
          expected: testCase.output.trim(),
          output: '',
          status: 'error',
          stderr: err?.response?.data || err.message,
          errorLines: [],
          execTime: null
        });
      }
    }
    return res.status(StatusCodes.OK).json(results);
  } catch (error) {
    console.error('[runCode] Error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to run code.'
    });
  }
};

export const submitSolution = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, language } = req.body;

        const problem = await Problem.findById(id);

        if (!problem) {
            throw new ErrorResponse(`Problem with id ${id} not found`, StatusCodes.NOT_FOUND);
        }

        const supportedLanguages = ['cpp', 'c', 'java'];
        if (!supportedLanguages.includes(language)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Only C, C++, and Java are supported for submissions.'
            });
        }

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
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'Compilation Error',
                    status: 'compilation_error',
                    error: compileRes.data.stderr
                });
            }
        } catch (err) {
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
                
                if (compileRes.data.stderr && compileRes.data.stderr.trim() !== '') {
                    status = 'runtime_error';
                    errorMessage = compileRes.data.stderr;
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
                
                if (testResult.status === 'passed') {
                    testCasesPassed++;
                } else {
                    status = 'wrong_answer';
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

                if (execTime > problem.timeLimit) {
                    status = 'time_limit_exceeded';
                    break;
                }
                
                const memoryUsed = Math.floor(Math.random() * 50) + 10;
                totalMemoryUsed = Math.max(totalMemoryUsed, memoryUsed);
                
            } catch (error) {
                console.error('Error executing test case:', error);
                status = 'runtime_error';
                errorMessage = error.message || 'Execution failed';
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

function addJavaImports(userCode) {
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
        
  const hasUtilImport = userCode.includes('import java.util.*;') || 
                       userCode.includes('import java.util.*');
  
  if (usesCollections && !hasUtilImport) {
    return 'import java.util.*;\n' + userCode;
  }
  
  return userCode;
}

function getWrapCodeFunction(language) {
  switch (language) {
    case 'cpp':
      return wrapCppCode;
    case 'java':
      return wrapJavaCode;
    case 'c':
      return wrapCCode;
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
} 