# Algo_project

## 📚 Overview

**Algo_project** is a full-stack online judge platform designed for competitive programming and coding practice. It allows users to register, solve algorithmic problems, submit code in multiple languages (C, C++, Java), and receive instant feedback. The system is built for high concurrency, robust performance, and a smooth user experience, making it suitable for both individual learning and large-scale contests.

---


<img width="5668" height="2312" alt="Online judge flow" src="https://github.com/user-attachments/assets/432f944c-67b0-4220-a801-7e29e20f559c" />


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

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables:**
   Copy the example environment files and update them with your configuration:
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   cp Compiler/.env.example Compiler/.env
   ```
   
   **Required environment variables:**
   - **Server**: `MONGODB_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GEMINI_API_KEY`
   - **Client**: `VITE_GOOGLE_CLIENT_ID`, `VITE_API_URL`
   - **Compiler**: `PORT` (optional, defaults to 8000)

4. **Start services (development mode):**
   ```bash
   # Option 1: Using Docker (recommended)
   npm run dev
   
   # Option 2: Manual start (requires MongoDB running locally)
   # Terminal 1 - Server
   cd server && npm run server
   
   # Terminal 2 - Compiler Service  
   cd Compiler && npm run compiler
   
   # Terminal 3 - Client
   cd client && npm run dev
   ```

5. **Access the application:**
   - Frontend: [http://localhost:5173](http://localhost:5173) (development) or [http://localhost:3000](http://localhost:3000) (production)
   - Backend API: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
   - Compiler Service: [http://localhost:8000](http://localhost:8000)
   - Health Checks: 
     - Server: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)
     - Compiler: [http://localhost:8000/health](http://localhost:8000/health)

### Development Commands

From the root directory:
- `npm run install:all` - Install dependencies for all services
- `npm run dev` - Start all services with Docker
- `npm run lint` - Run linting for client and server
- `npm run lint:fix` - Automatically fix linting issues

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

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up the development environment
- Code style and quality standards  
- Submitting pull requests
- Adding new features

### Quick Contribution Setup
```bash
git clone https://github.com/harshit27gupta/Algo_project.git
cd Algo_project
npm run install:all
cp server/.env.example server/.env
# Update environment variables
npm run dev
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with modern web technologies (React, Node.js, Express, MongoDB)
- Containerized with Docker for easy deployment
- Load tested with Artillery for production readiness
- AI-powered features using Google's Gemini API
