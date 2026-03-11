import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useInView } from "react-intersection-observer";
import { useQuery } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { AlertCircle } from "lucide-react";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State for filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "default");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [filters, setFilters] = useState({
    isOrganic: searchParams.get("isOrganic") === "true",
    isGlutenFree: searchParams.get("isGlutenFree") === "true",
    isVegan: searchParams.get("isVegan") === "true",
    isLocal: searchParams.get("isLocal") === "true",
  });
  const [selectedTags, setSelectedTags] = useState<string[]>(searchParams.get("tags")?.split(",").filter(Boolean) || []);
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get("brand") || "all");
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const { data: config } = useQuery({
    queryKey: ['store-config'],
    queryFn: async () => {
      const res = await fetch('/api/store-config');
      return res.json();
    }
  });

  const isStoreClosed = useMemo(() => {
    if (!config) return false;
    if (!config.orderingEnabled) return true;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const { start, end } = config.openHours || {};
    if (start && end) {
      return currentTime < start || currentTime > end;
    }
    return false;
  }, [config]);

  // Infinite Scroll state
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { ref, inView } = useInView();

  // Initial data fetch
  useEffect(() => {
    fetch('/api/categories').then(res => res.json()).then(setCategories);
    fetch('/api/products/brands').then(res => res.json()).then(setBrands);
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async (pageNum: number, isNewSearch: boolean = false) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedBrand && selectedBrand !== 'all') params.append('brand', selectedBrand);
      if (sortBy !== 'default') params.append('sort', sortBy);
      if (filters.isOrganic) params.append('isOrganic', 'true');
      if (filters.isGlutenFree) params.append('isGlutenFree', 'true');
      if (filters.isVegan) params.append('isVegan', 'true');
      if (filters.isLocal) params.append('isLocal', 'true');
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));
      params.append('minPrice', priceRange[0].toString());
      params.append('maxPrice', priceRange[1].toString());
      params.append('page', pageNum.toString());
      params.append('limit', '12');

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      if (isNewSearch) {
        setProducts(data.products);
      } else {
        setProducts(prev => [...prev, ...data.products]);
      }

      setHasMore(data.page < data.pages);
      setPage(data.page);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCategory, selectedBrand, sortBy, filters, priceRange]);

  // Handle filter changes
  useEffect(() => {
    setPage(1);
    fetchProducts(1, true);

    // Update URL params
    const newParams = new URLSearchParams();
    if (search) newParams.set("search", search);
    if (selectedCategory) newParams.set("category", selectedCategory);
    if (selectedBrand && selectedBrand !== 'all') newParams.set("brand", selectedBrand);
    if (sortBy !== 'default') newParams.set("sort", sortBy);
    if (filters.isOrganic) newParams.set("isOrganic", "true");
    if (filters.isGlutenFree) newParams.set("isGlutenFree", "true");
    if (filters.isVegan) newParams.set("isVegan", "true");
    if (filters.isLocal) newParams.set("isLocal", "true");
    if (selectedTags.length > 0) newParams.set("tags", selectedTags.join(","));
    setSearchParams(newParams);
  }, [search, selectedCategory, selectedBrand, sortBy, filters, selectedTags, priceRange, fetchProducts, setSearchParams]);

  // Load more on scroll
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      fetchProducts(page + 1);
    }
  }, [inView, hasMore, isLoading, page, fetchProducts]);

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Price Range</h3>
        <Slider
          defaultValue={[0, 100]}
          max={100}
          step={1}
          value={priceRange}
          onValueChange={setPriceRange}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Dietary & Preferences</h3>
        <div className="space-y-3">
          {Object.entries(filters).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={key}
                checked={value}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, [key]: checked === true }))}
              />
              <label htmlFor={key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize">
                {key.replace('is', '').replace(/([A-Z])/g, ' $1').trim()}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Dietary Tags</h3>
        <div className="flex flex-wrap gap-2">
          {['Dairy-Free', 'Nut-Free', 'Keto', 'Paleo', 'Sugar-Free', 'Non-GMO'].map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                setSelectedTags(prev =>
                  prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                );
              }}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Brand</h3>
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger>
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map(brand => (
              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="container py-8 relative">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">Shop Groceries</h1>

        {isStoreClosed && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex items-center gap-4 text-amber-800">
            <AlertCircle className="h-6 w-6 shrink-0" />
            <div>
              <p className="font-bold">
                {!config?.orderingEnabled
                  ? "Delivery is currently unavailable. It will be available soon."
                  : "The store is currently closed. Delivery will be available soon."}
              </p>
              {config?.storeMessage && <p className="text-sm opacity-90">{config.storeMessage}</p>}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-8 bg-card border rounded-xl p-6 h-fit">
              <div className="flex items-center justify-between">
                <h2 className="font-bold flex items-center gap-2">
                  <SlidersHorizontal size={18} />
                  Filters
                </h2>
                <Button variant="ghost" size="sm" onClick={() => {
                  setPriceRange([0, 100]);
                  setFilters({ isOrganic: false, isGlutenFree: false, isVegan: false, isLocal: false });
                  setSelectedBrand("all");
                }}>
                  Reset
                </Button>
              </div>
              <FilterContent />
            </div>
          </aside>

          <div className="flex-1">
            {/* Top Bar - Pinned on Mobile/Desktop */}
            <div className="sticky top-16 z-30 bg-background/95 backdrop-blur py-4 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products, brands, tags..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 bg-muted/50 border-0"
                  />
                </div>

                <div className="flex gap-2">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="py-6">
                        <FilterContent />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Newest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Top Rated</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick Category Bar */}
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                <Button
                  variant={!selectedCategory || selectedCategory === "all" ? "default" : "secondary"}
                  size="sm"
                  className="rounded-full shrink-0"
                  onClick={() => setSelectedCategory("all")}
                >
                  All
                </Button>
                {categories.map(c => (
                  <Button
                    key={c._id}
                    variant={selectedCategory === c._id ? "default" : "secondary"}
                    size="sm"
                    className="rounded-full shrink-0"
                    onClick={() => setSelectedCategory(c._id)}
                  >
                    {c.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Results Grid */}
            {products.length === 0 && !isLoading ? (
              <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                <p className="text-lg text-muted-foreground">No products found. Try adjusting your filters.</p>
                <Button variant="link" onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                  setSelectedBrand("all");
                  setFilters({ isOrganic: false, isGlutenFree: false, isVegan: false, isLocal: false });
                }}>Clear all filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map((p, idx) => (
                  <ProductCard key={p._id || idx} product={{
                    id: p._id,
                    name: p.name,
                    brand: p.brand,
                    category: p.category.name,
                    basePrice: p.basePrice,
                    salePrice: p.salePrice,
                    image: p.imageURL || "/placeholder.svg",
                    stock: p.stock,
                    averageRating: p.averageRating,
                    reviewCount: p.numReviews,
                    description: p.description,
                    unit: p.unit || "unit"
                  }} />
                ))}
              </div>
            )}

            {/* Infinite Scroll Trigger */}
            <div ref={ref} className="py-10 flex justify-center w-full">
              {isLoading && (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm text-muted-foreground">Loading more products...</p>
                </div>
              )}
              {!hasMore && products.length > 0 && (
                <p className="text-sm text-muted-foreground">You've reached the end of the catalog.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
