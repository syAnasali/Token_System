import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard'; // Admin Dashboard Import
import CustomerOrder from './pages/CustomerOrder';
import Login from './pages/Login';
import TokenDisplay from './pages/TokenDisplay';
import WorkerDashboard from './pages/WorkerDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Navigation placeholder for dev - usually you wouldn't show all links to everyone */}
        <nav className="bg-gray-800 text-white p-4">
          <ul className="flex space-x-4">
            <li><Link to="/" className="hover:text-gray-300">Customer</Link></li>
            <li><Link to="/worker" className="hover:text-gray-300">Worker</Link></li>
            <li><Link to="/display" className="hover:text-gray-300">Display</Link></li>
            <li><Link to="/admin" className="hover:text-gray-300">Admin</Link></li>
          </ul>
        </nav>

        <main className="flex-grow p-4">
          <Routes>
            <Route path="/" element={<CustomerOrder />} />
            <Route path="/login" element={<Login />} />
            <Route path="/worker" element={
              <ProtectedRoute>
                <WorkerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/display" element={<TokenDisplay />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
