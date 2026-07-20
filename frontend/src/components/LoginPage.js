// src/components/LoginPage.js
import React, { useState } from 'react';
import { BrainCircuit, User, Key, LogIn } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const loginSuccessful = onLogin(username, password);

    if (!loginSuccessful) {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-screen bg-slate-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg border border-slate-200">
        
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-4">
            <BrainCircuit className="text-blue-600" size={40} />
            <h1 className="font-bold text-3xl tracking-tight text-slate-800">ST-HybridRec</h1>
          </div>
          <p className="text-slate-500">Please sign in to access the analysis engine.</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700"
              placeholder="Username"
            />
          </div>

          <div className="relative">
            <Key className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700"
              placeholder="Password"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100 font-medium">
              {error}
            </p>
          )}
          
          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95"
            >
              <LogIn size={18} />
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}