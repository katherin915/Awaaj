import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { FaExclamationCircle, FaEnvelope, FaLock } from "react-icons/fa";
import { motion } from "framer-motion";
import 'react-toastify/dist/ReactToastify.css';
import loginImage from "../assets/signup.png";
import API_BASE from "../utils/api";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Dispatch event for other components to update
      window.dispatchEvent(new Event('storage'));

      toast.success("🎉 Login Successful");
      
      // Redirect based on role
      setTimeout(() => {
        if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (data.user.role === 'officer') {
          navigate('/officer/dashboard');
        } else {
          navigate('/user/dashboard');
        }
      }, 1000);

    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen items-center justify-center font-inter relative bg-gray-50 dark:bg-gray-900">
        {/* Left Side - Image */}
        <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden md:flex md:w-1/2 justify-center items-center bg-transparent p-8"
        >
        <motion.img
            src={loginImage}
            alt="Login Illustration"
            className="w-full max-w-lg object-contain drop-shadow-2xl rounded-xl"
            animate={{
            y: [0, -15, 0],
            }}
            transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
            }}
        />
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="md:w-1/2 w-full flex justify-center p-4"
        >
            <div className="rounded-2xl border border-emerald-100 bg-white/90 backdrop-blur-md p-8 shadow-xl md:p-10 w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
            
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                    Welcome Back
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sign in to access your Awaaz account
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaEnvelope className="text-gray-400" />
                        </div>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLock className="text-gray-400" />
                        </div>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg flex items-center">
                        <FaExclamationCircle className="mr-2 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-3 font-medium transition-all shadow-lg hover:shadow-emerald-500/30 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Signing in...
                        </div>
                    ) : (
                        'Sign In'
                    )}
                </button>
            </form>

            {/* Footer */}
            <div className="text-center pt-6 mt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don’t have an account?{' '}
                    <Link to="/signup" className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">
                        Sign up
                    </Link>
                </p>
                <div className="mt-4">
                    <Link
                    to="/"
                    className="inline-block text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                    ← Back to Home
                    </Link>
                </div>
            </div>

            </div>
        </motion.div>

        <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Login;
