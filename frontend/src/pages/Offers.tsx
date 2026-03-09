import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/data";
import { Percent, Clock, Zap } from "lucide-react";

export default function Offers() {
  const saleProducts = products.filter(p => p.salePrice);
  const topDeals = products.slice(0, 6);

  return (
    <Layout>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
        <div className="container text-center">
          <Zap className="h-12 w-12 mx-auto mb-4 text-secondary" />
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Today's Deals & Offers</h1>
          <p className="text-primary-foreground/80 text-lg max-w-lg mx-auto">
            Fresh savings on your favorite products. Don't miss out!
          </p>
        </div>
      </section>

      <div className="container py-12">
        {/* Flash Sales */}
        {saleProducts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Percent className="h-5 w-5 text-destructive" />
              </div>
              <h2 className="font-display text-2xl font-bold">Flash Sales</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {saleProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Top Deals */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <h2 className="font-display text-2xl font-bold">Popular Products</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {topDeals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      </div>
    </Layout>
  );
}
