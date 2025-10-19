import { GiVortex } from "react-icons/gi";
import { FaGoogle } from "react-icons/fa";
import "../StarryBackground.css";

const API = import.meta.env.VITE_BaseAPI;

const Auth = () => {
  return (
    <>
      <div className="stars stars1"></div>
      <div className="stars stars2"></div>
      <div className="stars stars3"></div>
      <div className="stars stars4"></div>
      <div className="stars stars5"></div>
      <div className="stars stars6"></div>
      <div className="relative z-20 flex items-center justify-center min-h-screen text-white">
        <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-purple-700/50 max-w-md w-full text-center">
          <div className="flex justify-center items-center mb-6">
            <GiVortex className="text-purple-500 h-12 w-12" />
            <h1 className="text-4xl font-bold ml-3">Vortex</h1>
          </div>
          <p className="text-gray-300 mb-8 text-lg">
            Please log in with Google to continue
          </p>
          <a href={`${API}/api/auth/google`}>
            <button className="w-full flex items-center justify-center cursor-pointer bg-purple-700 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105">
              <FaGoogle className="mr-3 h-5 w-5" />
              Login with Google
            </button>
          </a>
        </div>
      </div>
    </>
  );
};

export default Auth;
