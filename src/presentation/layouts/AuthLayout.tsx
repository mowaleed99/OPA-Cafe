import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FDFBF7] relative overflow-hidden selection:bg-[#8B5E3C]/20">
      {/* Decorative background blobs for a warm cafe feel */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-[#F3E8E0] blur-3xl opacity-60" />
        <div className="absolute bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#EAE0D5] blur-3xl opacity-60" />
      </div>
      
      {/* Login Form Container */}
      <div className="w-full max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8 sm:p-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
