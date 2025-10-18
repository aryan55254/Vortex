import { GiVortex } from "react-icons/gi";
import { FiUser, FiLogOut } from "react-icons/fi"; // Added FiLogOut icon
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

function Header() {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleProfileToggle = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-black/50 backdrop-blur-sm border-b border-purple-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and App Name */}
          <div className="flex items-center">
            <GiVortex className="text-purple-500 h-10 w-10" />
            <div className="text-white font-bold text-3xl ml-2">Vortex</div>
          </div>

          {/* Profile Section - relative positioning for the dropdown */}
          <div className="relative">
            <button
              onClick={handleProfileToggle}
              className="flex items-center justify-center h-12 w-12 rounded-full text-white bg-gray-800 hover:bg-purple-700 transition-colors duration-300"
              aria-label="Toggle profile menu"
            >
              <FiUser className="h-6 w-6 cursor-pointer" />
            </button>

            {/* Profile Dropdown Card */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-72 origin-top-right bg-black/50 backdrop-blur-md rounded-xl border border-purple-700/50 shadow-lg z-50">
                <div className="p-4">
                  {/* User Avatar and Info */}
                  <div className="flex items-center mb-4">
                    <img
                      className="h-12 w-12 rounded-full border-2 border-purple-500 object-cover"
                      src={
                        "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%221.5%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M17.982%2018.725A7.488%207.488%200%200012%2015.75a7.488%207.488%200%2000-5.982%202.975m11.963%200a9%209%200%2010-11.963%200m11.963%200A8.966%208.966%200%200112%2021a8.966%208.966%200%2001-5.982-2.275M15%209.75a3%203%200%2011-6%200%203%203%200%20016%200z%22%20%2F%3E%3C%2Fsvg%3E"
                      }
                      alt="User Avatar"
                    />
                    <div className="ml-4 truncate">
                      <p className="text-lg font-semibold text-white truncate">
                        {user?.displayName || "Guest User"}
                      </p>
                      <p className="text-sm text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex cursor-pointer items-center justify-center bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
                  >
                    <FiLogOut className="mr-2 h-5 w-5" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
