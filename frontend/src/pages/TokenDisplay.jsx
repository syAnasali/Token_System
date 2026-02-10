import { useEffect, useState } from 'react';
import { api } from '../api';
import { socket } from '../socket';

export default function TokenDisplay() {
  const [tokens, setTokens] = useState([]);

  const fetchTokens = () => {
    api.get('/api/display/queue').then(setTokens).catch(console.error);
  };

  useEffect(() => {
    fetchTokens();
    socket.on('status_updated', fetchTokens);
    socket.on('order_created', fetchTokens);
    // socket.on('queue:updated', fetchTokens); // Backend doesn't emit this yet

    return () => {
      socket.off('status_updated');
      socket.off('order_created');
      // socket.off('queue:updated');
    };
  }, []);

  const nowServing = tokens.filter(t => t.status === 'SERVING');
  const upcoming = tokens.filter(t => t.status === 'PENDING').slice(0, 5); // Show top 5

  return (
    <div className="h-screen bg-gray-900 text-white p-8 flex flex-col">
      <header className="flex justify-between items-center mb-10 border-b border-gray-700 pb-4">
        <h1 className="text-4xl font-bold">NOW SERVING</h1>
        <div className="text-xl text-gray-400">{new Date().toLocaleTimeString()}</div>
      </header>

      <div className="flex-grow flex gap-8">
        {/* Left: Now Serving (Large) */}
        <div className="w-2/3 grid gap-4 content-start">
           {nowServing.length > 0 ? (
             nowServing.map(token => (
               <div key={token.id} className="bg-green-600 rounded-xl p-10 flex items-center justify-between shadow-2xl animate-pulse">
                 <div>
                   <div className="text-2xl opacity-80 uppercase tracking-widest">Token Number</div>
                   <div className="text-9xl font-black">{token.number}</div>
                 </div>
                 <div className="text-right">
                   <div className="text-4xl font-bold">Counter 1</div>
                 </div>
               </div>
             ))
           ) : (
             <div className="text-center text-gray-500 text-4xl mt-20">Please wait...</div>
           )}
        </div>

        {/* Right: Up Next */}
        <div className="w-1/3 bg-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6 border-b border-gray-600 pb-2">UP NEXT</h2>
          <div className="space-y-4">
            {upcoming.map((token, index) => (
              <div key={token.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <span className="text-3xl font-bold text-yellow-500">{token.number}</span>
                <span className="text-gray-400">#{index + 1}</span>
              </div>
            ))}
            {upcoming.length === 0 && (
                <div className="text-center text-gray-500 mt-10">Queue Empty</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
