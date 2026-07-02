import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Failed to sign in");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050508] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/20 mb-4">
            <Lock className="w-7 h-7 text-[#00F0FF]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Trexium Hub</h1>
          <p className="text-sm text-[#A0A0A0] mt-1">Sign in to continue</p>
        </div>
        <div className="bg-[#0D0D12] border border-[#1E1E26] rounded-2xl p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-[#A0A0A0] text-xs">Email</Label>
              <Input
                type="email"
                autoFocus
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-12 bg-[#050508] border-[#1E1E26] text-white placeholder:text-[#3A3A45]"
                required
              />
            </div>
            <div>
              <Label className="text-[#A0A0A0] text-xs">Password</Label>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 h-12 bg-[#050508] border-[#1E1E26] text-white placeholder:text-[#3A3A45]"
                required
              />
            </div>
            <Button type="submit" className="w-full h-12 bg-[#0A93B0] hover:bg-[#0A7B95] text-white font-medium" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}