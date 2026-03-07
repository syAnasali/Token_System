import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('workerToken');
    navigate('/login');
  };

  // Filters state
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchOrders();
  }, [filterStartDate, filterEndDate, filterStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (filterStartDate) filters.startDate = filterStartDate;
      if (filterEndDate) filters.endDate = filterEndDate;
      if (filterStatus && filterStatus !== 'All') filters.status = filterStatus;

      const data = await api.getOrdersList(filters);
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Derived metrics
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrders = orders.length;

  const getItems = (order) => {
    if (!order || !order.items) return [];
    if (Array.isArray(order.items)) return order.items;
    if (typeof order.items === 'string') {
        try {
            return JSON.parse(order.items);
        } catch (e) {
            console.error("Failed to parse items", e);
            return [];
        }
    }
    return [];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500">Sales Reports and Management</p>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold transition-colors"
        >
          Logout
        </button>
      </header>

     

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Filtered Revenue</p>
            <p className="text-2xl font-bold text-gray-800">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Filtered Orders</p>
            <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          </div>
        </div>
      </div>

      {/* Filters & Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4 items-center justify-between">
          <h2 className="font-semibold text-gray-700">Order History</h2>
          <div className="flex flex-wrap gap-3">
            <input 
              type="date" 
              className="px-3 py-2 border rounded-md text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              title="Start Date"
            />
            <span className="text-gray-400 self-center">to</span>
            <input 
              type="date" 
              className="px-3 py-2 border rounded-md text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              title="End Date"
            />
            <select 
              className="px-3 py-2 border rounded-md text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="SERVING">Serving</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <button 
              onClick={() => { setFilterStartDate(''); setFilterEndDate(''); setFilterStatus('All'); }}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear
            </button>
          </div>
        </div>

        {error ? (
          <div className="p-8 text-center text-red-500">
            Error loading data: {error}
          </div>
        ) : loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            Loading reports...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-500 text-sm border-b">
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Token</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Items</th>
                  <th className="p-4 font-medium text-right">Total Cost</th>
                  <th className="p-4 font-medium text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      No orders found matching filters.
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-800 font-medium">#{order.id}</td>
                      <td className="p-4">
                        {order.Token ? (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold">
                            {order.Token.number}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                           order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                           order.status === 'SERVING' ? 'bg-yellow-100 text-yellow-800' :
                           order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                           'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                         {(() => {
                            const items = getItems(order);
                            if (items.length === 0) return <span className="text-gray-400 italic">No Items</span>;
                            return (
                               <ul className="list-disc pl-4 space-y-1">
                                  {items.map((item, idx) => (
                                     <li key={idx} className="text-xs">
                                        <span className="font-semibold text-gray-800">{item.quantity}x</span> {item.name}
                                     </li>
                                  ))}
                               </ul>
                            );
                         })()}
                      </td>
                      <td className="p-4 text-right font-medium text-gray-800">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="p-4 text-right text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
