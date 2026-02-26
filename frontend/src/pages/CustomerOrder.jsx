import { useEffect, useState } from 'react';
import { api } from '../api';
import { socket } from '../socket';

const IconShoppingBag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);
const IconClock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const IconHash = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>
);

export default function CustomerOrder() {
  const [token, setToken] = useState(null);
  const [position, setPosition] = useState(null);
  const [eta, setEta] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    
    api.get('/menu-items').then(items => setMenuItems(items)).catch(console.error);

    
    socket.on('token:updated', (updatedToken) => {
      if (token && updatedToken.id === token.id) {
        setToken(updatedToken);
      }
    });

    socket.on('queue:updated', (data) => {
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
          setToken(data.token);
          setPosition(data.position);
          setEta(data.eta);
      } catch (e) { console.error(e); }
  };

  const addToCart = (item) => {
    setCart(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
  };

  const removeFromCart = (item) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[item.id] > 1) {
        newCart[item.id] -= 1;
      } else {
        delete newCart[item.id];
      }
      return newCart;
    });
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
      setToken(res.token);
      setPosition(res.position);
      setEta(res.eta);
      setCart({});
    } catch (err) {
      alert("Failed to place order: " + err.message);
    }
  };

  const totalAmount = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menuItems.find(m => m.id === parseInt(id));
    return sum + (item ? item.price * qty : 0);
  }, 0).toFixed(2);

  if (token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-1 opacity-95">Your Token</h2>
            <p className="text-blue-100 text-sm">Order #{token.id}</p>
          </div>
          
          <div className="p-8">
            <div className="flex flex-col items-center justify-center mb-8">
                <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-blue-50/50">
                     <span className="text-6xl font-black text-blue-600">{token.number}</span>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${
                    token.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                    token.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700 animate-pulse'
                }`}>
                    {token.status}
                </div>
            </div>
            
            {token.status === 'PENDING' && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                        <div className="flex items-center justify-center text-gray-400 mb-2">
                             <IconHash />
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Position</div>
                        <div className="text-2xl font-bold text-gray-800">{position}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                         <div className="flex items-center justify-center text-gray-400 mb-2">
                             <IconClock />
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Est. Wait</div>
                        <div className="text-2xl font-bold text-gray-800">{eta}</div>
                    </div>
                </div>
            )}
            
            {(token.status === 'COMPLETED' || token.status === 'CANCELLED') && (
                <button 
                  onClick={() => setToken(null)}
                  className="w-full mt-6 py-4 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  Place New Order
                </button>
            )}
          </div>
          <div className="bg-gray-50 p-4 text-center text-xs text-gray-400">
               Keep this screen open to track your order
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-32">
        {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
             <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Menu</h1>
                <p className="text-xs text-gray-500 font-medium">Premium Selection</p>
             </div>
             <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                 <span className="font-bold text-gray-700">A</span>
             </div>
        </div>
      </header>

      {/* Menu Grid */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 px-1">Featured Items</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {menuItems.map(item => (
            <div key={item.id} className="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex justify-between items-start gap-4">
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">Freshly prepared with premium ingredients.</p>
                    <div className="mt-3 font-mono font-bold text-lg text-gray-900">${item.price}</div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                     <button 
                        onClick={() => addToCart(item)}
                        className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-200 active:scale-90"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    </button>
                    {cart[item.id] > 0 && (
                        <div className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm animate-in fade-in zoom-in duration-200">
                            {cart[item.id]}x
                        </div>
                    )}
                </div>
            </div>
            ))}
        </div>
      </main>
      
      {/* Floating Cart Dock */}
      {Object.keys(cart).length > 0 && (
          <div className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto z-40">
              <div 
                  className="bg-gray-900/95 backdrop-blur-xl text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between border border-white/10 ring-1 ring-black/5 cursor-pointer"
                  onClick={() => setIsCartOpen(true)}
              >
                  <div className="flex items-center gap-4 pl-2">
                       <div className="p-2 bg-white/10 rounded-xl relative">
                            <div className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 bg-red-500 rounded-full border-2 border-gray-900 flex items-center justify-center text-[10px] font-bold">
                                {Object.values(cart).reduce((a,b)=>a+b, 0)}
                            </div>
                            <IconShoppingBag />
                       </div>
                       <div>
                           <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Total</p>
                           <p className="text-xl font-bold font-mono">${totalAmount}</p>
                       </div>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCartOpen(true);
                    }}
                    className="px-6 py-3 bg-white text-gray-900 font-bold rounded-2xl shadow hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                  >
                    View Cart <ChevronRight />
                  </button>
              </div>
          </div>
      )}

      {/* Cart Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}>
          <div 
             className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
             onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-black text-gray-900">Your Cart</h2>
              <button 
                onClick={() => setIsCartOpen(false)} 
                className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                aria-label="Close cart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {Object.keys(cart).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <IconShoppingBag />
                  <p className="mt-4 font-medium">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(cart).map(([id, quantity]) => {
                    const item = menuItems.find(m => m.id === parseInt(id));
                    if (!item) return null;
                    return (
                      <div key={id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex-1 pr-4">
                          <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                          <p className="text-blue-600 font-mono font-bold text-sm mt-1">${item.price}</p>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1 border border-gray-100">
                          <button 
                            onClick={() => removeFromCart(item)}
                            className="w-8 h-8 rounded-full bg-white text-gray-600 flex items-center justify-center shadow-sm hover:text-red-500 hover:bg-red-50 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
                          </button>
                          <span className="font-bold w-4 text-center text-gray-900">{quantity}</span>
                          <button 
                            onClick={() => addToCart(item)}
                            className="w-8 h-8 rounded-full bg-white text-gray-600 flex items-center justify-center shadow-sm hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {Object.keys(cart).length > 0 && (
              <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-4 px-2">
                  <span className="text-gray-500 font-semibold tracking-wide uppercase text-sm">Total Amount</span>
                  <span className="text-2xl font-black font-mono text-gray-900">${totalAmount}</span>
                </div>
                <button 
                  onClick={() => {
                     setIsCartOpen(false);
                     placeOrder();
                  }}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex justify-center items-center gap-2"
                >
                  Checkout <ChevronRight />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      
      <svg style={{ display: 'none' }}>
        <symbol id="icon-chevron-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"/>
        </symbol>
      </svg>
    </div>
  );
}


const ChevronRight = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);
