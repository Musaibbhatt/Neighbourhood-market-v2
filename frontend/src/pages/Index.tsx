import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, Leaf, Heart } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/lib/data";

export default function Home() {
  const featuredProducts = products.slice(0, 4);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&h=1080&fit=crop"
            alt="Fresh Produce"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--hero-overlay))]/80 to-[hsl(var(--hero-overlay))]/50" />
        </div>
        <div className="container relative z-10 text-center py-20">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 max-w-3xl mx-auto leading-tight">
            Your Local Store for Everyday Essentials
          </h1>
          <p className="text-lg md:text-xl text-white/85 mb-8 max-w-xl mx-auto">
            Fresh groceries, daily dairy, and essential household items delivered right from your neighborhood.
          </p>
          <Link to="/shop">
            <Button size="lg" className="rounded-full px-8 text-base bg-secondary text-secondary-foreground hover:bg-secondary/90">
              Shop Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Social Proof Ticker */}
      <div className="bg-primary py-3">
        <p className="text-center text-sm text-primary-foreground/90">
          🛒 Over <strong>2,000+</strong> happy customers this week • Free delivery on orders above $50
        </p>
      </div>

      {/* Categories */}
      <section className="container py-16">
        <h2 className="font-display text-3xl font-bold text-center mb-10">Explore Our Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.id}`}
              className="group bg-card border rounded-xl p-6 text-center hover:border-primary hover:shadow-md transition-all duration-300"
            >
              <span className="text-4xl block mb-3">{cat.icon}</span>
              <h3 className="font-sans font-semibold text-sm group-hover:text-primary transition-colors">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl font-bold">Fresh Picks</h2>
            <Link to="/shop" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-3">
            <Leaf className="h-10 w-10 mx-auto text-secondary" />
            <h3 className="font-display text-xl font-semibold">Fresh Products</h3>
            <p className="text-primary-foreground/70 text-sm max-w-xs mx-auto">Sourced daily to ensure the highest quality for your family.</p>
          </div>
          <div className="space-y-3">
            <span className="text-4xl block">💰</span>
            <h3 className="font-display text-xl font-semibold">Affordable Prices</h3>
            <p className="text-primary-foreground/70 text-sm max-w-xs mx-auto">Everyday low prices on all the essentials you need.</p>
          </div>
          <div className="space-y-3">
            <Truck className="h-10 w-10 mx-auto text-secondary" />
            <h3 className="font-display text-xl font-semibold">Local Convenience</h3>
            <p className="text-primary-foreground/70 text-sm max-w-xs mx-auto">Fast local pickup and friendly faces you know and trust.</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
