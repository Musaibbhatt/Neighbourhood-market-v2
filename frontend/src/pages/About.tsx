import Layout from "@/components/Layout";
import { Users, Leaf, Heart, Award } from "lucide-react";

export default function About() {
  return (
    <Layout>
      <div className="container py-16 max-w-4xl">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-center mb-6">About Us</h1>
        <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-16">
          We're more than just a store — we're your neighbors, committed to bringing fresh, quality products to your doorstep.
        </p>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="font-display text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Neighbourhood Market started as a small corner store with a big dream: to make fresh, quality groceries accessible to every family in the community.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Today, we serve thousands of happy customers while staying true to our roots — local sourcing, fair prices, and a personal touch that big chains can't match.
            </p>
          </div>
          <div className="bg-muted/50 rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&h=400&fit=crop"
              alt="Our Store"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Users, label: "2,000+", desc: "Happy Customers" },
            { icon: Leaf, label: "100%", desc: "Fresh Products" },
            { icon: Heart, label: "50+", desc: "Local Suppliers" },
            { icon: Award, label: "5 Years", desc: "Serving Community" },
          ].map((stat, i) => (
            <div key={i} className="bg-card border rounded-xl p-6 text-center">
              <stat.icon className="h-8 w-8 mx-auto text-primary mb-3" />
              <p className="font-display text-2xl font-bold">{stat.label}</p>
              <p className="text-sm text-muted-foreground">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
