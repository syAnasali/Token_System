import { useEffect, useState } from 'react';
import { api } from '../api';
import { socket } from '../socket';

export default function CustomerOrder() {
  const [token, setToken] = useState(null);
  const [position, setPosition] = useState(null);
  const [eta, setEta] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState({});

  useEffect(() => {
    // Load menu items
    api.get('/menu-items').then(items => setMenuItems(items)).catch(console.error);

    // Listen for updates
    socket.on('token:updated', (updatedToken) => {
      if (token && updatedToken.id === token.id) {
        setToken(updatedToken);
      }
    });
    
    // Listen for queue updates to recalculate position/eta
    socket.on('queue:updated', (data) => {
       // In a real app, backend might push specific updates for a user, 
       // or we'd fetch position. For MVP, we might re-fetch status.
       if (token) refreshStatus(token.id);
    });

    return () => {
      socket.off('token:updated');
      socket.off('queue:updated');
    };
  }, [token]);

  const refreshStatus = async (tokenId) => {
      try {
          const data = await api.get(`/api/orders/${tokenId}/status`);
          // Expecting { token, position, eta }
          setToken(data.token);
          setPosition(data.position);
          setEta(data.eta);
      } catch (e) { console.error(e); }
  };

  const addToCart = (item) => {
    setCart(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
  };

  const placeOrder = async () => {
    const items = Object.entries(cart).map(([id, quantity]) => {
        const item = menuItems.find(m => m.id === parseInt(id));
        return { ...item, quantity };
    });
    
    if (items.length === 0) return alert("Cart empty");

    try {
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const res = await api.post('/api/orders', { items, total });
      // res should be { order, token, position, eta }
      setToken(res.token);
      setPosition(res.position);
      setEta(res.eta);
      setCart({});
    } catch (err) {
      alert("Failed to place order: " + err.message);
    }
  };

  if (token) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg mt-10">
        <h2 className="text-2xl font-bold mb-4 text-center">Your Token</h2>
        <div className="text-center">
            <div className="text-6xl font-black text-blue-600 mb-4">{token.number}</div>
            <div className="text-xl font-semibold mb-2">Status: <span className="text-blue-500">{token.status}</span></div>
            
            {token.status === 'PENDING' && (
                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-gray-100 p-3 rounded">
                        <div className="text-sm text-gray-500">Position</div>
                        <div className="text-2xl font-bold">{position}</div>
                    </div>
                    <div className="bg-gray-100 p-3 rounded">
                        <div className="text-sm text-gray-500">Est. Wait</div>
                        <div className="text-2xl font-bold">{eta}</div>
                    </div>
                </div>
            )}
            
            {(token.status === 'COMPLETED' || token.status === 'CANCELLED') && (
                <button 
                  onClick={() => setToken(null)}
                  className="mt-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Place New Order
                </button>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Menu</h1>
      <div className="grid gap-4">
        {menuItems.map(item => (
          <div key={item.id} className="flex justify-between items-center p-4 bg-white shadow rounded">
            <div>
              <h3 className="font-bold">{item.name}</h3>
              <p className="text-gray-600">${item.price}</p>
            </div>
            <div className="flex items-center gap-3">
               {cart[item.id] > 0 && <span className="font-bold">{cart[item.id]}x</span>}
               <button 
                 onClick={() => addToCart(item)}
                 className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
               >
                 Add
               </button>
            </div>
          </div>
        ))}
      </div>
      
      {Object.keys(cart).length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-between items-center">
              <span className="font-bold text-xl">
                  Total: ${Object.entries(cart).reduce((sum, [id, qty]) => {
                      const item = menuItems.find(m => m.id === parseInt(id));
                      return sum + (item ? item.price * qty : 0);
                  }, 0).toFixed(2)}
              </span>
              <button 
                onClick={placeOrder}
                className="px-6 py-3 bg-green-600 text-white font-bold rounded shadow hover:bg-green-700"
              >
                Place Order
              </button>
          </div>
      )}
    </div>
  );
}
