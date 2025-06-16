import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter } from 'react-icons/fa';
import './Home.css';
import { toast } from 'react-toastify';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    difficulty: 'all',
    category: 'all',
    status: 'all'
  });
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    setLogoutLoading(true);
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      setUser(null);
      setLogoutLoading(false);
      toast.success('Logged out!');
      navigate('/');
    }, 1500);
  };

  // Mock data for problems (will be replaced with API data)
  const problems = [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      category: "Array",
      acceptanceRate: "85%",
      status: "solved"
    },
    {
      id: 2,
      title: "Add Two Numbers",
      difficulty: "Medium",
      category: "Linked List",
      acceptanceRate: "65%",
      status: "attempted"
    },
    {
      id: 3,
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      category: "String",
      acceptanceRate: "45%",
      status: "unsolved"
    }
  ];

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <h1>Online Judge</h1>
          <div className="header-actions">
            {user ? (
              <>
                <span className="user-info">
                  <span className="user-name-full">{user.fullName.split(' ')[0]}</span>
                </span>
                <button className="auth-button primary" onClick={handleLogout} disabled={logoutLoading} style={{marginLeft: 0}}>
                  {logoutLoading ? (<><span>Logging out</span></>) : 'Logout'}
                </button>
              </>
            ) : (
              <>
                <Link to="/auth/login" className="auth-button">Sign In</Link>
                <Link to="/auth/register" className="auth-button primary">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="home-main">
        <div className="problems-header">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filters">
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="all">All Categories</option>
              <option value="array">Array</option>
              <option value="string">String</option>
              <option value="linked-list">Linked List</option>
              <option value="tree">Tree</option>
              <option value="graph">Graph</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All Status</option>
              <option value="solved">Solved</option>
              <option value="attempted">Attempted</option>
              <option value="unsolved">Unsolved</option>
            </select>
          </div>
        </div>

        <div className="problems-list">
          {problems.map(problem => (
            <Link to={`/problem/${problem.id}`} key={problem.id} className="problem-card">
              <div className="problem-info">
                <h3>{problem.title}</h3>
                <div className="problem-meta">
                  <span className={`difficulty ${problem.difficulty.toLowerCase()}`}>
                    {problem.difficulty}
                  </span>
                  <span className="category">{problem.category}</span>
                  <span className="acceptance-rate">
                    Acceptance Rate: {problem.acceptanceRate}
                  </span>
                </div>
              </div>
              <div className={`status ${problem.status}`}>
                {problem.status.charAt(0).toUpperCase() + problem.status.slice(1)}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home; 