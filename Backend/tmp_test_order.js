const fetch = require('node-fetch');

(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Test',
        phone: '123',
        address: 'Test',
        products: [
          { id: 'prod1', name: 'Organic Apples', price: 3.99, quantity: 1, variant: 'lb', imageURL: '/placeholder.svg' }
        ],
        subtotal: 3.99,
        deliveryFee: 0,
        totalPrice: 3.99,
        orderType: 'Delivery',
        paymentMethod: 'Cash'
      })
    });

    console.log('status', res.status);
    console.log(await res.text());
  } catch (err) {
    console.error('error', err);
  }
})();