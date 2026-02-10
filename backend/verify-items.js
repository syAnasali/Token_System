const http = require('http');

const API_PORT = 3000;
const API_HOST = 'localhost';

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: '/api' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`Status ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function verify() {
  console.log('Starting verification (native http)...');

  // 1. Place Order
  console.log('Placing order...');
  try {
    const orderData = {
      items: [
        { id: 1, name: 'Burger', price: 10, quantity: 2 },
        { id: 2, name: 'Fries', price: 5, quantity: 1 }
      ],
      total: 25
    };
    
    await request('POST', '/orders', orderData);
    console.log('Order placed successfully.');
  } catch (error) {
    if (error.message.includes('ECONNREFUSED')) {
        console.error('Server is not running. Please start the server.');
    } else {
        console.error('Failed to place order:', error.message);
    }
    process.exit(1);
  }

  // 2. Fetch queue
  console.log('Fetching queue...');
  try {
    const queue = await request('GET', '/display/queue');
    
    // 3. Check items
    console.log('Checking items format...');
    const lastOrder = queue[queue.length - 1];
    
    if (!lastOrder) {
        console.error('Queue is empty!');
        process.exit(1);
    }

    if (lastOrder && lastOrder.order && Array.isArray(lastOrder.order.items)) {
      console.log('SUCCESS: Items are an array!');
      console.log('Items:', JSON.stringify(lastOrder.order.items, null, 2));
    } else {
      console.error('FAILURE: Items are NOT an array.');
      console.log('Received:', typeof lastOrder.order.items, lastOrder.order.items);
      process.exit(1);
    }

  } catch (error) {
    console.error('Failed to fetch queue:', error.message);
    process.exit(1);
  }
}

verify();
