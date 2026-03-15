import React from "react";

export default function Payment() {
  return (
    <div className="p-8 max-w-3xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        Payment
      </h1>

      <div className="space-y-4">

        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Payment Method</h2>

          <select className="border p-2 w-full rounded">
            <option>Credit / Debit Card</option>
            <option>Cash on Delivery</option>
            <option>PayPal</option>
          </select>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Order Summary</h2>

          <p className="text-gray-600">
            Review your order before placing it.
          </p>
        </div>

        <button className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700">
          Confirm Payment
        </button>

      </div>

    </div>
  );
}