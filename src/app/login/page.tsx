"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (
  e: React.FormEvent
) => {
  e.preventDefault();

  if (
    email === "admin@trustivasetu.com" &&
    password === "Admin@123"
  ) {
    localStorage.setItem(
      "trustiva-user",
      JSON.stringify({
        role: "SUPER_ADMIN",
        region: "ALL",
        email,
      })
    );

    router.push("/partner");
  } else {
    alert("Invalid Credentials");
  }
};

  return (
  <div className="min-h-screen bg-[#07111f] flex items-center justify-center px-4">
    
    <form
      onSubmit={handleLogin}
      className="bg-white/5 border border-white/10 rounded-3xl p-10 w-full max-w-md"
    >
      <h1 className="text-4xl font-bold text-white mb-8 text-center">
        Trustiva LOS
      </h1>

      <input
        type="email"
        placeholder="Company Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
        className="w-full p-3 rounded-xl bg-white/10 text-white mb-4 outline-none"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
        className="w-full p-3 rounded-xl bg-white/10 text-white mb-6 outline-none"
      />

      <button
        type="submit"
        className="w-full bg-lime-300 text-black py-3 rounded-xl font-semibold"
      >
        Login
      </button>
    </form>

  </div>
);
}