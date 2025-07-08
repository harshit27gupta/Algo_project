# Algo_project

## 📚 Overview

**Algo_project** is a full-stack online judge platform designed for competitive programming and coding practice. It allows users to register, solve algorithmic problems, submit code in multiple languages (C, C++, Java), and receive instant feedback. The system is built for high concurrency, robust performance, and a smooth user experience, making it suitable for both individual learning and large-scale contests.

---

## ✨ Features

- **User Authentication**
  - Register, login, and Google OAuth support
  - Secure password storage and validation

- **Problem Management**
  - Browse, search, and filter coding problems
  - Detailed problem statements with constraints and examples
  - Admin features for creating, updating, and deleting problems

- **Code Submission & Execution**
  - Submit solutions in C, C++, or Java
  - Real-time code compilation and execution
  - Custom test case support
  - Accurate execution time measurement

- **User Profile & Statistics**
  - View and update user profile
  - Track solved problems and submission history
  - View personal statistics and progress

- **AI Assistance**
  - Get hints for problems
  - Chatbot for programming help and general queries
  - Track hint usage per problem

- **Performance & Reliability**
  - Optimized rate limiting and database queries
  - Robust error handling and user-friendly error messages
  - Isolated code execution to prevent race conditions

---

## 🚀 Deployment

### Prerequisites

- **Node.js** (v18+)
- **MongoDB** (local or cloud)
- **Docker & Docker Compose** (for containerized deployment, optional)

### Quick Start (Development)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/harshit27gupta/Algo_project.git
   cd Algo_project
   ```

2. **Install dependencies:**
   ```bash
   cd server && npm install
   cd ../Compiler && npm install
   cd ../client && npm install
   ```

3. **Set up environment variables:**
   - Create your env file with the following details
   - | Server                | Client                | Compiler      | 
     |-----------------------|-----------------------|---------------|
     | PORT                  | VITE_GOOGLE_CLIENT_ID | PORT          |
     | MONGODB_URI           | VITE_API_URL          | 688ms         | 
     | JWT_SECRET            |                       |               | 
     | JWT_EXPIRE            |                       |               | 
     | NODE_ENV              |                       |               | 
     | GOOGLE_CLIENT_ID      |                       |               | 
     | GOOGLE_CLIENT_SECRET  |                       |               |
     | GEMINI_API_KEY        |                       |               |
     | COMPILER_URL          |                       |               |


4. **Start services (development mode):**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```
   Or run each service manually for local development.

5. **Access the app:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
   - Compiler Service: [http://localhost:8000](http://localhost:8000)

### Production Deployment

- Use `docker-compose.yml` for production-ready deployment.
- Adjust rate limits and environment variables as needed.
- Consider adding Redis for caching and session management.
- Set up monitoring and load balancing for high-availability.

---

## 🧪 Testing & Performance

The system has been thoroughly tested to ensure it can handle high loads and provide a reliable experience.

### Load Testing

- **Tools Used:** Artillery (professional-grade load testing)
- **Concurrent Users:** 150+ supported
- **Request Rate:** 30 requests/second sustained
- **Compiler Service:** 100+ concurrent compilations (C, C++, Java)

### Key Results

| Metric                | Before         | After         | Improvement         |
|-----------------------|---------------|---------------|---------------------|
| Success Rate          | 53%           | 100%          | +47%                |
| Max Response Time     | 8,288ms       | 688ms         | 12x faster          |
| Mean Response Time    | 2,154ms       | 141ms         | 15x faster          |
| 95th Percentile       | 6,703ms       | 290ms         | 23x faster          |
| Rate Limit Errors     | 131           | 0             | 100% reduction      |
| Failed Requests       | 70            | 0             | 100% reduction      |

- **Compiler Service:** 100% success rate, average response time 2.41s, all languages supported, no timeouts or crashes under load.

### Error Handling & User Experience

- Error messages are clear and mapped to the correct lines in user code.
- Warnings are treated as errors for better feedback.
- Error lines are highlighted in the code editor.
- Java submissions are fully isolated to prevent file conflicts.

---

## 🏆 Conclusion

Algo_project is a robust, production-ready online judge system. It delivers fast, reliable performance, supports multi-language code execution, and provides a user-friendly experience for both learners and competitive programmers.
