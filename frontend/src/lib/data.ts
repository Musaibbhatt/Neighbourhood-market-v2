// Mock product data for the grocery store
export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  basePrice: number;
  salePrice?: number;
  image: string;
  stock: number;
  averageRating: number;
  reviewCount: number;
  description: string;
  unit: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  unit: string;
}

export const categories = [
  { id: "produce", name: "Fresh Produce", icon: "🥬", image: "/placeholder.svg" },
  { id: "dairy", name: "Dairy & Eggs", icon: "🥛", image: "/placeholder.svg" },
  { id: "bakery", name: "Bakery & Snacks", icon: "🍞", image: "/placeholder.svg" },
  { id: "meat", name: "Meat & Seafood", icon: "🥩", image: "/placeholder.svg" },
  { id: "beverages", name: "Beverages", icon: "🥤", image: "/placeholder.svg" },
  { id: "pantry", name: "Pantry Staples", icon: "🥫", image: "/placeholder.svg" },
];

export const products: Product[] = [
  {
    id: "1", name: "Organic Bananas", brand: "FreshFarm", category: "produce",
    basePrice: 2.49, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop",
    stock: 50, averageRating: 4.5, reviewCount: 128, description: "Fresh organic bananas, perfect for smoothies and snacking.", unit: "bunch"
  },
  {
    id: "2", name: "Fresh Strawberries", brand: "BerryBest", category: "produce",
    basePrice: 4.99, salePrice: 3.49, image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop",
    stock: 30, averageRating: 4.8, reviewCount: 95, description: "Sweet, juicy strawberries picked at peak ripeness.", unit: "pack"
  },
  {
    id: "3", name: "Whole Milk", brand: "DairyPure", category: "dairy",
    basePrice: 3.99, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop",
    stock: 45, averageRating: 4.3, reviewCount: 67, description: "Farm-fresh whole milk, vitamin D fortified.", unit: "gallon"
  },
  {
    id: "4", name: "Sourdough Bread", brand: "ArtisanBake", category: "bakery",
    basePrice: 5.49, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop",
    stock: 20, averageRating: 4.7, reviewCount: 203, description: "Handcrafted sourdough bread with a crispy crust.", unit: "loaf"
  },
  {
    id: "5", name: "Free-Range Eggs", brand: "HappyHens", category: "dairy",
    basePrice: 5.99, image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop",
    stock: 40, averageRating: 4.6, reviewCount: 156, description: "Grade A free-range eggs from pasture-raised hens.", unit: "dozen"
  },
  {
    id: "6", name: "Avocados", brand: "FreshFarm", category: "produce",
    basePrice: 1.99, image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=400&fit=crop",
    stock: 35, averageRating: 4.4, reviewCount: 89, description: "Ripe Hass avocados, ready to eat.", unit: "each"
  },
  {
    id: "7", name: "Orange Juice", brand: "SunSqueeze", category: "beverages",
    basePrice: 4.49, image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop",
    stock: 25, averageRating: 4.2, reviewCount: 74, description: "100% pure squeezed orange juice, no added sugar.", unit: "bottle"
  },
  {
    id: "8", name: "Chicken Breast", brand: "NaturalChoice", category: "meat",
    basePrice: 8.99, salePrice: 6.99, image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop",
    stock: 15, averageRating: 4.5, reviewCount: 112, description: "Boneless, skinless chicken breast fillets.", unit: "lb"
  },
  {
    id: "9", name: "Greek Yogurt", brand: "DairyPure", category: "dairy",
    basePrice: 3.49, image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop",
    stock: 60, averageRating: 4.6, reviewCount: 198, description: "Creamy Greek yogurt, high in protein.", unit: "tub"
  },
  {
    id: "10", name: "Pasta Sauce", brand: "ItalianHeart", category: "pantry",
    basePrice: 3.29, image: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400&h=400&fit=crop",
    stock: 55, averageRating: 4.3, reviewCount: 87, description: "Traditional marinara sauce made with vine-ripened tomatoes.", unit: "jar"
  },
  {
    id: "11", name: "Baby Spinach", brand: "GreenLeaf", category: "produce",
    basePrice: 3.99, image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop",
    stock: 28, averageRating: 4.4, reviewCount: 63, description: "Tender baby spinach leaves, triple washed.", unit: "bag"
  },
  {
    id: "12", name: "Croissants", brand: "ArtisanBake", category: "bakery",
    basePrice: 4.99, salePrice: 3.99, image: "https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400&h=400&fit=crop",
    stock: 18, averageRating: 4.8, reviewCount: 145, description: "Buttery, flaky croissants baked fresh daily.", unit: "4-pack"
  },
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
