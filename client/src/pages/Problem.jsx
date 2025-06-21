import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaPlay, 
  FaCode, 
  FaEye, 
  FaEyeSlash, 
  FaCopy, 
  FaCheck,
  FaTimes,
  FaClock,
  FaMemory,
  FaTrophy,
  FaUser,
  FaCalendar,
  FaTag,
  FaLightbulb,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getProblem, submitSolution, runCode } from '../services/api';
import './Problem.css';

const Problem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [showTestCases, setShowTestCases] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [runningCode, setRunningCode] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [activeResultTab, setActiveResultTab] = useState(0);

  const languages = [
    { value: 'javascript', label: 'JavaScript', extension: '.js' },
    { value: 'python', label: 'Python', extension: '.py' },
    { value: 'java', label: 'Java', extension: '.java' },
    { value: 'cpp', label: 'C++', extension: '.cpp' },
    { value: 'c', label: 'C', extension: '.c' }
  ];

  const defaultCode = {
    javascript: `function solution(input) {
    // Your solution here
    return input;
}`,
    python: `def solution(input):
    # Your solution here
    return input`,
    java: `public class Solution {
    public static String solution(String input) {
        // Your solution here
        return input;
    }
}`,
    cpp: `#include <iostream>
#include <string>
using namespace std;

string solution(string input) {
    // Your solution here
    return input;
}`,
    c: `#include <stdio.h>
#include <string.h>

char* solution(char* input) {
    // Your solution here
    return input;
}`
  };

  useEffect(() => {
    fetchProblem();
  }, [id]);

  useEffect(() => {
    setCode(defaultCode[language]);
  }, [language]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProblem(id);
      setProblem(response.data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before running');
      return;
    }

    try {
      setRunningCode(true);
      setRunResult(null);
      
      const response = await runCode(id, code, language);
      setRunResult(response.data);
      setActiveTab('run_result'); // Switch to the result tab
      toast.success('Code executed successfully!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRunningCode(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before submitting');
      return;
    }

    try {
      setSubmitting(true);
      setSubmissionResult(null);
      
      const response = await submitSolution(id, code, language);
      setSubmissionResult(response.data);
      
      if (response.data.status === 'accepted') {
        toast.success('Congratulations! Your solution is correct!');
      } else {
        toast.error(`Submission failed: ${response.data.status.replace('_', ' ')}`);
      }
      setActiveTab('submission_result');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <FaCheckCircle className="status-icon accepted" />;
      case 'wrong_answer':
        return <FaTimes className="status-icon wrong" />;
      case 'time_limit_exceeded':
        return <FaClock className="status-icon tle" />;
      case 'memory_limit_exceeded':
        return <FaMemory className="status-icon mle" />;
      case 'runtime_error':
        return <FaExclamationTriangle className="status-icon error" />;
      default:
        return <FaExclamationTriangle className="status-icon error" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return '#10b981';
      case 'wrong_answer': return '#ef4444';
      case 'time_limit_exceeded': return '#f59e0b';
      case 'memory_limit_exceeded': return '#8b5cf6';
      case 'runtime_error': return '#f97316';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="problem-loading">
        <div className="loading-spinner"></div>
        <p>Loading problem...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="problem-error">
        <p>Error: {error}</p>
        <button onClick={fetchProblem} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="problem-not-found">
        <p>Problem not found</p>
        <Link to="/" className="back-button">Back to Problems</Link>
      </div>
    );
  }

  return (
    <div className="problem-container">
      {/* Header */}
      <header className="problem-header">
        <div className="header-content">
          <Link to="/" className="back-button">
            <FaArrowLeft />
            Back to Problems
          </Link>
          <div className="problem-title-section">
            <h1>{problem.title}</h1>
            <div className="problem-meta">
              <span 
                className="difficulty-badge"
                style={{ backgroundColor: getDifficultyColor(problem.difficulty) }}
              >
                {problem.difficulty}
              </span>
              {problem.rating > 0 && (
                <span className="rating-badge">
                  Rating: {problem.rating}
                </span>
              )}
              <span className="acceptance-rate">
                Acceptance: {problem.totalSubmissions > 0 
                  ? `${Math.round((problem.successfulSubmissions / problem.totalSubmissions) * 100)}%`
                  : '0%'
                }
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="problem-main">
        {/* Left Panel - Problem Description */}
        <div className="problem-left-panel">
          <div className="problem-tabs">
            <button 
              className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              <FaCode />
              Description
            </button>
            <button 
              className={`tab-button ${activeTab === 'testcases' ? 'active' : ''}`}
              onClick={() => setActiveTab('testcases')}
            >
              <FaEye />
              Test Cases
            </button>
            <button 
              className={`tab-button ${activeTab === 'run_result' ? 'active' : ''}`}
              onClick={() => setActiveTab('run_result')}
              disabled={!runResult}
            >
              <FaPlay />
              Run Result
            </button>
            <button 
              className={`tab-button ${activeTab === 'submission_result' ? 'active' : ''}`}
              onClick={() => setActiveTab('submission_result')}
              disabled={!submissionResult}
            >
              <FaTrophy />
              Submission
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="description-content">
                <div className="problem-description">
                  <h3>Problem Statement</h3>
                  <p>{problem.description}</p>
                </div>

                <div className="problem-constraints">
                  <h3>Constraints</h3>
                  <div className="constraints-grid">
                    <div className="constraint-item">
                      <FaClock />
                      <span>Time Limit: {problem.timeLimit}ms</span>
                    </div>
                    <div className="constraint-item">
                      <FaMemory />
                      <span>Memory Limit: {problem.memoryLimit}MB</span>
                    </div>
                  </div>
                </div>

                <div className="problem-categories">
                  <h3>Categories</h3>
                  <div className="categories-list">
                    {problem.categories.map((category, index) => (
                      <span key={index} className="category-tag">
                        <FaTag />
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="problem-author">
                  <h3>Author</h3>
                  <div className="author-info">
                    <div className="info-item">
                      <FaUser />
                      <span>{problem.author?.fullName || 'Unknown'}</span>
                    </div>
                    <div className="info-item">
                      <FaCalendar />
                      <span>Published: {new Date(problem.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'testcases' && (
              <div className="testcases-content">
                <div className="testcases-header">
                  <h3>Public Test Cases</h3>
                  <button 
                    className="toggle-testcases"
                    onClick={() => setShowTestCases(!showTestCases)}
                  >
                    {showTestCases ? <FaEyeSlash /> : <FaEye />}
                    {showTestCases ? 'Hide' : 'Show'} Test Cases
                  </button>
                </div>

                {showTestCases && (
                  <div className="testcases-list">
                    {problem.publicTestCases.map((testCase, index) => (
                      <div key={index} className="testcase-item">
                        <div className="testcase-header">
                          <h4>Test Case {index + 1}</h4>
                        </div>
                        <div className="testcase-content">
                          <div className="testcase-input">
                            <h5>Input:</h5>
                            <pre>{testCase.input}</pre>
                          </div>
                          <div className="testcase-output">
                            <h5>Expected Output:</h5>
                            <pre>{testCase.output}</pre>
                          </div>
                          {testCase.explanation && (
                            <div className="testcase-explanation">
                              <h5>Explanation:</h5>
                              <p>{testCase.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'run_result' && runResult && (
              <div className="run-results-container">
                <h3>Run Results</h3>
                <div className="run-results-tabs">
                  {runResult.map((result, index) => (
                    <button
                      key={index}
                      className={`result-tab-button ${activeResultTab === index ? 'active' : ''} ${result.status}`}
                      onClick={() => setActiveResultTab(index)}
                    >
                      Case {index + 1}
                    </button>
                  ))}
                </div>
                <div className="run-result-content">
                  <div className="result-detail">
                    <span className="detail-label">Status:</span>
                    <span className={`detail-value status ${runResult[activeResultTab].status}`}>
                      {runResult[activeResultTab].status}
                    </span>
                  </div>
                  <div className="result-detail">
                    <span className="detail-label">Input:</span>
                    <pre className="detail-value">{runResult[activeResultTab].input}</pre>
                  </div>
                  <div className="result-detail">
                    <span className="detail-label">Your Output:</span>
                    <pre className="detail-value output">{runResult[activeResultTab].output}</pre>
                  </div>
                  <div className="result-detail">
                    <span className="detail-label">Expected Output:</span>
                    <pre className="detail-value expected">{runResult[activeResultTab].expected}</pre>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'submission_result' && submissionResult && (
              <div className="submission-result-container">
                <div className="result-header">
                  <h3>Submission Result</h3>
                </div>
                <div className="result-content">
                  <div className="result-status">
                    {getStatusIcon(submissionResult.status)}
                    <span 
                      className="status-text"
                      style={{ color: getStatusColor(submissionResult.status) }}
                    >
                      {submissionResult.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="result-metrics">
                    <div className="metric-item">
                      <FaClock />
                      <span>Time: {submissionResult.executionTime}ms</span>
                    </div>
                    <div className="metric-item">
                      <FaMemory />
                      <span>Memory: {submissionResult.memoryUsed}MB</span>
                    </div>
                    <div className="metric-item">
                      <FaTrophy />
                      <span>Test Cases: {submissionResult.testCasesPassed}/{submissionResult.totalTestCases}</span>
                    </div>
                  </div>

                  {submissionResult.status === 'accepted' && (
                    <div className="success-message">
                      <FaLightbulb />
                      <span>Great job! Your solution passed all test cases!</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="problem-right-panel">
          <div className="editor-header">
            <div className="language-selector">
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="language-select"
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="editor-actions">
              <button 
                className="copy-button"
                onClick={handleCopyCode}
                title="Copy code"
              >
                {copied ? <FaCheck /> : <FaCopy />}
              </button>
            </div>
          </div>

          <div className="code-editor">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your solution here..."
              className="code-textarea"
              spellCheck="false"
            />
          </div>

          <div className="editor-footer">
            <button 
              className="run-button"
              onClick={handleRunCode}
              disabled={runningCode || submitting}
            >
              {runningCode ? (
                <>
                  <FaSpinner className="spinner" />
                  Running...
                </>
              ) : (
                <>
                  <FaPlay />
                  Run Code
                </>
              )}
            </button>
            <button 
              className="submit-button"
              onClick={handleSubmit}
              disabled={submitting || runningCode}
            >
              {submitting ? (
                <>
                  <FaSpinner className="spinner" />
                  Submitting...
                </>
              ) : (
                <>
                  <FaTrophy />
                  Submit Solution
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Problem; 