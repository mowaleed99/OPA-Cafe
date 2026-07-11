import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../application/store/useAuthStore';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error);
      setIsLoading(false);
      return;
    }

    navigate('/pos', { replace: true });
  };

  return (
    <div className="w-full space-y-8">
      {/* Header with Logo */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="h-24 w-24 rounded-full bg-white shadow-sm border border-[#EAE0D5] flex items-center justify-center overflow-hidden p-2">
          <img 
            src="/OPA-logo.png" 
            alt="OPA CAFE Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#4A3728]">
            Welcome to OPA
          </h2>
          <p className="text-[#8B7355] text-sm mt-1">
            Please enter your details to sign in.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 text-center animate-in slide-in-from-top-2">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-[#4A3728] ml-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@opa.com"
            className="w-full px-4 py-3 bg-white/50 border border-[#EAE0D5] rounded-2xl text-sm text-[#4A3728] placeholder:text-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30 focus:border-[#8B5E3C] focus:bg-white transition-all duration-200"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between ml-1">
            <label htmlFor="password" className="block text-sm font-medium text-[#4A3728]">
              Password
            </label>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full ps-4 pe-12 py-3 bg-white/50 border border-[#EAE0D5] rounded-2xl text-sm text-[#4A3728] placeholder:text-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/30 focus:border-[#8B5E3C] focus:bg-white transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-4 top-1/2 -translate-y-1/2 text-[#A89F91] hover:text-[#4A3728] transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 mt-2 flex items-center justify-center bg-[#8B5E3C] text-white rounded-2xl font-medium text-sm transition-all hover:bg-[#704A2F] disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgb(139,94,60,0.39)] hover:shadow-[0_6px_20px_rgba(139,94,60,0.23)] active:scale-[0.98]"
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin text-white/80" />
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Footer text */}
      <div className="pt-2 text-center">
        <p className="text-xs text-[#A89F91]">
          Powered by O P A Cafe Point of Sale
        </p>
      </div>
    </div>
  );
}
