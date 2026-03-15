import React from "react";
import { useCart } from "@/contexts/CartContext";

interface Product {
  _id: string;
  name: string;
  description?: string;
  brand?: string;
  category?: string;
  basePrice?: number;
  salePrice?: number;
  price?: number;
  image?: string;
  stock?: number;
}

interface Props {
  product: Product;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  const { addToCart } = useCart();

  const price =
    product.salePrice ??
    product.basePrice ??
    product.price ??
    0;

  const handleAddToCart = () => {
    addToCart({
      id: product._id,
      name: product.name,
      price: price,
      image: product.image || "/placeholder.png",
      quantity: 1,
      unit: "item"
    });
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition flex flex-col">

      <img
        src={product.image || "/placeholder.png"}
        alt={product.name}
        className="w-full h-40 object-cover rounded"
      />

      <h3 className="mt-2 font-semibold">
        {product.name}
      </h3>

      {product.brand && (
        <p className="text-sm text-gray-500">
          {product.brand}
        </p>
      )}

      {product.description && (
        <p className="text-xs text-gray-500 mt-1">
          {product.description}
        </p>
      )}

      <p className="text-gray-700 font-medium mt-2">
        ${price}
      </p>

      <button
        onClick={handleAddToCart}
        className="mt-3 bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Add to Cart
      </button>

    </div>
  );
};

export default ProductCard;