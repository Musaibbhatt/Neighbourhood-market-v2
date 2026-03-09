import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "@/components/ui/sonner";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast(isLogin ? "Logged in successfully!" : "Account created successfully!");
  };

  return (
    <Layout>
      <div className="container py-16 max-w-md">
        <div className="bg-card border rounded-2xl p-8">
          {/* Toggle */}
          <div className="flex bg-muted rounded-full p-1 mb-8">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all ${isLogin ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all ${!isLogin ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Sign Up
            </button>
          </div>

          <h1 className="font-display text-2xl font-bold mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {isLogin ? "Sign in to your account" : "Join the neighbourhood"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div><Label>Full Name</Label><Input required placeholder="John Doe" /></div>
            )}
            <div><Label>Email</Label><Input type="email" required placeholder="john@example.com" /></div>
            <div><Label>Password</Label><Input type="password" required placeholder="••••••••" /></div>
            {!isLogin && (
              <div><Label>Confirm Password</Label><Input type="password" required placeholder="••••••••" /></div>
            )}
            <Button type="submit" className="w-full rounded-full">
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
