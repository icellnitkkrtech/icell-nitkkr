import React, { useState } from 'react';
import { Mail, Lock, User, Users, Briefcase, CheckCircle2 } from 'lucide-react';

const Register = () => {
    const [role, setRole] = useState('member'); // 'member', 'leader'
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const roles = [
        { id: 'member', label: 'Club Member', icon: Users },
        { id: 'leader', label: 'Leader', icon: Briefcase }
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Registration attempt (UI only):', { ...formData, role });
        // Removed mockup success screen to avoid confusing it with a real backend request
        alert("Registration form data captured locally (UI only). No backend request was sent.");
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12 text-center">
                <div className="w-full max-w-md space-y-6 bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                    <div className="flex justify-center">
                        <div className="p-4 bg-yellow-400/10 rounded-full">
                            <CheckCircle2 className="text-yellow-400" size={48} />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white">Request Sent!</h2>
                    <p className="text-white/60">
                        Your registration as a <span className="text-yellow-400 font-semibold">{role === 'member' ? 'Club Member' : 'Leader'}</span> has been submitted.
                    </p>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm text-white/80">
                        A request has been sent to the Admin for approval. You will be able to login once your account is verified.
                    </div>
                    <a 
                        href="/login" 
                        className="block w-full py-3.5 px-4 rounded-2xl text-sm font-bold text-black bg-yellow-400 hover:bg-yellow-300 transition-all"
                    >
                        Back to Login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12">
            <div className="w-full max-w-md space-y-8 bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
                    <p className="mt-2 text-sm text-white/60">Join the iCell community</p>
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

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-yellow-400 transition-colors">
                                <User size={18} />
                            </div>
                            <input
                                name="name"
                                type="text"
                                required
                                className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all"
                                placeholder="Full Name"
                                onChange={handleChange}
                            />
                        </div>
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

                    <button
                        type="submit"
                        className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-2xl text-black bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-all duration-300"
                    >
                        Register as {role === 'member' ? 'Member' : 'Leader'}
                    </button>
                    
                    <p className="text-center text-sm text-white/60">
                        Already have an account?{' '}
                        <a href="/login" className="text-yellow-400 font-medium hover:text-yellow-300">
                            Log in
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
