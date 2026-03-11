import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { toast } from "@/components/ui/sonner";

export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Message sent! We'll get back to you soon.");
  };

  return (
    <Layout>
      <div className="container py-16 max-w-5xl">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-center mb-6">Contact Us</h1>
        <p className="text-lg text-muted-foreground text-center max-w-xl mx-auto mb-12">
          Have a question or feedback? We'd love to hear from you.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            {[
              { icon: MapPin, title: "Address", text: "123 Market Street, Downtown, NY 10001" },
              { icon: Phone, title: "Phone", text: "+1 (555) 123-4567" },
              { icon: Mail, title: "Email", text: "hello@neighbourhood.market" },
              { icon: Clock, title: "Hours", text: "Mon-Fri: 7am-10pm, Sat-Sun: 8am-9pm" },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-card border rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name</Label><Input required placeholder="Your name" /></div>
              <div><Label>Email</Label><Input type="email" required placeholder="you@email.com" /></div>
            </div>
            <div><Label>Subject</Label><Input required placeholder="How can we help?" /></div>
            <div><Label>Message</Label><Textarea required placeholder="Tell us more..." rows={5} /></div>
            <Button type="submit" className="w-full rounded-full">Send Message</Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
