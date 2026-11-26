"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp, signIn } from "@/lib/supabase";

export default function AuthForm() {
    const [mode, setMode] = useState("signin");   // "signin" | "signup"
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);
    const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (mode === "signup") {
        await signUp(email, password);
        setMessage("Account created — check your email, then sign in.");
      }else {
        await signIn(email, password);
         router.push("/");
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <h3>{mode === "signin" ? "Sign in" : "Create account"}</h3>
      <input
        type="email" required placeholder="you@example.com"
        value={email} onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password" required placeholder="password"
        value={password} onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={busy}>{mode === "signin" ? "Sign in" : "Sign up"}</button>
      <p>
        {mode === "signin" ? "No account?" : "Have an account?"}{" "}
        <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
          {mode === "signin" ? "Sign up" : "Sign in"}
        </button>
      </p>
      {message ? <p className="error">{message}</p> : null}
    </form>
  );
}
