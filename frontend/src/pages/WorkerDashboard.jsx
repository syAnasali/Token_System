import { useEffect, useState } from 'react';
import { api } from '../api';
import { socket } from '../socket';

export default function WorkerDashboard() {
  const [tokens, setTokens] = useState([]);

  const fetchTokens = () => {
    api.get('/api/display/queue').then(setTokens).catch(console.error);
  };

  useEffect(() => {
    fetchTokens();

    socket.on('order_created', fetchTokens);
    socket.on('status_updated', fetchTokens);
    // socket.on('queue:updated', fetchTokens);

    return () => {
      socket.off('order_created');
      socket.off('status_updated');
      // socket.off('queue:updated');
    };
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/orders/${id}/status`, { status });
    } catch (err) {
      alert("Update failed");
    }
  };

  // Group tokens
  const serving = tokens.filter(t => t.status === 'SERVING');
  const pending = tokens.filter(t => t.status === 'PENDING');

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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Kitchen Display System</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Now Serving Column */}
        <div>
           <h2 className="text-xl font-bold mb-4 text-green-600 flex items-center gap-2">
             <span>🔥</span> Now Serving
           </h2>
           <div className="space-y-4">
             {serving.map(token => {
               const items = getItems(token.order);
               return (
               <div key={token.id} className="bg-green-50 border-l-4 border-green-500 p-4 shadow rounded flex justify-between items-center">
                 <div>
                   <div className="text-4xl font-black">{token.number}</div>
                   <div className="text-sm text-gray-600">Order #{token.orderId}</div>
                   {/* Display Items */}
                   {items.length > 0 ? (
                       <ul className="mt-2 text-sm text-gray-800 list-disc pl-5">
                           {items.map((item, idx) => (
                               <li key={idx}>
                                   <span className="font-bold">{item.quantity}x</span> {item.name}
                               </li>
                           ))}
                       </ul>
                   ) : <div className="text-xs text-red-500">No items data</div>}
                 </div>
                 <button 
                   onClick={() => updateStatus(token.id, 'COMPLETED')}
                   className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 h-fit"
                 >
                   DONE
                 </button>
               </div>
             )})}
             {serving.length === 0 && <div className="text-gray-400 italic">No active orders</div>}
           </div>
        </div>

        {/* Up Next Column */}
        <div>
           <h2 className="text-xl font-bold mb-4 text-gray-700">In Queue</h2>
           <div className="space-y-4">
             {pending.map(token => {
               const items = getItems(token.order);
               return (
               <div key={token.id} className="bg-white p-4 shadow rounded flex justify-between items-center border">
                 <div>
                   <div className="text-2xl font-bold">{token.number}</div>
                   <div className="text-sm text-gray-500">Wait: {token.eta || '--'}</div>
                   {/* Display Items */}
                   {items.length > 0 ? (
                       <ul className="mt-2 text-sm text-gray-800 list-disc pl-5">
                           {items.map((item, idx) => (
                               <li key={idx}>
                                   <span className="font-bold">{item.quantity}x</span> {item.name}
                               </li>
                           ))}
                       </ul>
                   ) : <div className="text-xs text-red-500">No items data</div>}
                 </div>
                 <button 
                   onClick={() => updateStatus(token.id, 'SERVING')}
                   className="bg-blue-500 text-white px-4 py-2 rounded font-bold hover:bg-blue-600 h-fit"
                 >
                   SERVING
                 </button>
               </div>
             )})}
             {pending.length === 0 && <div className="text-gray-400 italic">Queue empty</div>}
           </div>
        </div>
      </div>
    </div>
  );
}
