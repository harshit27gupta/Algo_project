import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Problem from './pages/Problem';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import Chatbot from './components/Chatbot';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/problem/:id" element={<Problem />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <Chatbot />
      </Router>
      <ToastContainer position="top-center" autoClose={1500} />
    </>
  );
}

export default App;
