import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Shop() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("default");

  const filtered = useMemo(() => {
    let result = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    switch (sortBy) {
      case "price-low": result.sort((a, b) => a.basePrice - b.basePrice); break;
      case "price-high": result.sort((a, b) => b.basePrice - a.basePrice); break;
      case "rating": result.sort((a, b) => b.averageRating - a.averageRating); break;
      case "name": result.sort((a, b) => a.name.localeCompare(b.name)); break;
    }

    return result;
  }, [search, selectedCategory, sortBy]);

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">Shop</h1>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={!selectedCategory || selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setSelectedCategory("")}
          >
            All
          </Button>
          {categories.map(c => (
            <Button
              key={c.id}
              variant={selectedCategory === c.id ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setSelectedCategory(c.id)}
            >
              {c.icon} {c.name}
            </Button>
          ))}
        </div>

        {/* Results */}
        <p className="text-sm text-muted-foreground mb-4">{filtered.length} products found</p>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">No products found. Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
