"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      setLoading(true);
      const data = await apiFetch<{ message?: string; user_id?: string }>(
        '/api/auth/signup',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }
      );
      setSuccess(data?.message || 'Account created successfully. Redirecting...');
      router.push('/auth?view=sign-in');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      <div>
        <label htmlFor="signup-email" className="block mb-1">Email</label>
        <input id="signup-email" name="email" type="email" className="w-full border rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="signup-password" className="block mb-1">Password</label>
        <input id="signup-password" name="password" type="password" className="w-full border rounded px-3 py-2" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="signup-confirm-password" className="block mb-1">Confirm Password</label>
        <input id="signup-confirm-password" name="confirm-password" type="password" className="w-full border rounded px-3 py-2" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}
      <button type="submit" className="w-full bg-green-600 text-white py-2 rounded" disabled={loading}>
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  );
}
