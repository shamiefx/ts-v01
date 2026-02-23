"use client";
import React, { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add forgot password logic
    alert('Password reset link sent!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
      <div>
        <label className="block mb-1">Email</label>
        <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <button type="submit" className="w-full bg-yellow-600 text-white py-2 rounded">Send Reset Link</button>
    </form>
  );
}
