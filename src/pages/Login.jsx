import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Loader2 } from "lucide-react";

const PASSWORD = "Trexium4994!";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (password === PASSWORD) {
        localStorage.setItem("trexium_auth", "true");
        window.location.href = "/";
      } else {
        setError("Incorrect password");
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050508] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/20 mb-4">
            <Lock className="w-7 h-7 text-[#00F0FF]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Trexium Hub</h1>
          <p className="text-sm text-[#A0A0A0] mt-1">Enter password to continue</p>
        </div>
        <div className="bg-[#0D0D12] border border-[#1E1E26] rounded-2xl p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              autoFocus
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 bg-[#050508] border-[#1E1E26] text-white placeholder:text-[#3A3A45]"
              required
            />
            <Button type="submit" className="w-full h-12 bg-[#00F0FF] hover:bg-[#00C8D6] text-white font-medium" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Enter"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}