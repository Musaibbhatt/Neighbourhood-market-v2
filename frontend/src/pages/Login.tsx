import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "@/components/ui/sonner";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const payload = isLogin ? { email, password } : { email, password, name: "New User", mobile: "0000000000" };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Logged in successfully!");

        if (data.user.role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      } else {
        toast.success("Account created! Please log in.");
        setIsLogin(true);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
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
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                required
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {!isLogin && (
              <div><Label>Confirm Password</Label><Input type="password" required placeholder="••••••••" /></div>
            )}
            <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
              {isLoading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
