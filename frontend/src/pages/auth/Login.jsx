import React, { useState } from 'react';
import { Mail, Lock, User, ShieldCheck, Users, Briefcase } from 'lucide-react';

const Login = () => {
    const [role, setRole] = useState('member'); // 'member', 'leader', 'admin'
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const roles = [
        { id: 'member', label: 'Member', icon: Users },
        { id: 'leader', label: 'Club Leader', icon: Briefcase },
        { id: 'admin', label: 'Admin', icon: ShieldCheck }
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Login attempt (UI only):', { ...formData, role });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12">
            <div className="w-full max-w-md space-y-8 bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
                    <p className="mt-2 text-sm text-white/60">Choose your role to continue</p>
                </div>

                {/* Role Selection Tabs */}
                <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5 gap-1">
                    {roles.map((r) => {
                        const Icon = r.icon;
                        const isActive = role === r.id;
                        return (
                            <button
                                key={r.id}
                                onClick={() => setRole(r.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 ${
                                    isActive 
                                    ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' 
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Icon size={14} />
                                {r.label}
                            </button>
                        );
                    })}
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-yellow-400 transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                name="email"
                                type="email"
                                required
                                className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all"
                                placeholder="Email address"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-yellow-400 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                name="password"
                                type="password"
                                required
                                className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all"
                                placeholder="Password"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-white/10 rounded bg-white/5"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-white/60">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-yellow-400 hover:text-yellow-300 transition-colors">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-2xl text-black bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-all duration-300"
                    >
                        Sign in as {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                    
                    <p className="text-center text-sm text-white/60">
                        Don't have an account?{' '}
                        <a href="/register" className="text-yellow-400 font-medium hover:text-yellow-300">
                            Register now
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
