import { BookOpen, Headphones, Home, Info, Mail, Target, User, UserPen } from "lucide-react";

const MobileBottomNav = ({ activePage, setPage, user, onLogin }) => {
  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      action: () => setPage("home")
    },
    {
      id: "about",
      label: "About",
      icon: Info,
      action: () => setPage("about")
    },
    {
      id: "support",
      label: "Support",
      icon: Mail,
      action: () => setPage("support") // Or scroll to specific section
    }, 
    {
      id: "profile",
      label: "Profile",
      icon: UserPen,
      action: () => {
        if (!user) onLogin();
        else setPage("profile");
      }
    },

  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a14]/95 backdrop-blur-lg border-t border-white/10 pb-safe pt-2 z-50 flex justify-between items-center px-6">
      {navItems.map((item) => {
        // Determine if this tab is active
        const isActive =
          activePage === item.id ||
          (item.id === "library" && activePage === "profile") ||
          (item.id === "menu" && activePage === "profile");

        return (
          <button
            key={item.id}
            onClick={item.action}
            className={`flex flex-col items-center gap-1 py-2 w-16 transition-colors duration-200 ${isActive ? "text-[#E50914]" : "text-gray-500 hover:text-gray-300"
              }`}
          >
            <item.icon
              size={24}
              // fill={isActive ? "currentColor" : "none"} // Fills icon if active

              strokeWidth={isActive ? 2.5 : 2}
            />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MobileBottomNav;