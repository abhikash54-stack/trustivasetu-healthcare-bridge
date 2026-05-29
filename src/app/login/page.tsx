"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (
  e: React.FormEvent
) => {
  e.preventDefault()

  const result = await signIn('credentials', {
    email,
    password,
    redirect: false,
  })

  if (result?.error) {
    alert('Invalid email or password')
  } else {
    router.push('/dashboard')
    router.refresh()
  }
}

  

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
