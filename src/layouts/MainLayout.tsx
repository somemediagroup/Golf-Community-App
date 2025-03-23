import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Home, 
  Trophy, 
  UserCircle,
  Users, 
  Newspaper,
  Settings,
  LogOut,
  Search,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from '@/components/ui/logo';
import { BRAND } from "@/constants/brand";

const MainLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
  };

  const handleLogout = () => {
    auth?.logout?.();
    navigate("/welcome");
  };

  const navItems = [
    { name: "Home", path: "/home", icon: <Home className="h-4 w-4 mr-2" /> },
    { name: "Courses", path: "/courses", icon: <Trophy className="h-4 w-4 mr-2" /> },
    { name: "Profile", path: "/profile", icon: <UserCircle className="h-4 w-4 mr-2" /> },
    { name: "Community", path: "/community", icon: <Users className="h-4 w-4 mr-2" /> },
    { name: "News", path: "/news", icon: <Newspaper className="h-4 w-4 mr-2" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#FBFCFB]/20 bg-[#448460] backdrop-blur supports-[backdrop-filter]:bg-[#448460]/95">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" className="md:hidden text-[#FBFCFB]" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <Link to="/home" className="flex items-center gap-2 text-[#FBFCFB]">
              <Logo variant="mono" size="sm" className="hidden md:block" />
              <Logo variant="golfball" size="sm" className="md:hidden" />
            </Link>
            
            <nav className="hidden md:flex items-center gap-5 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center transition-colors hover:text-[#FBFCFB]/70",
                    "text-[#FBFCFB]"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden md:block">
              {searchVisible ? (
                <div className="absolute right-0 top-0 w-60 flex items-center">
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="pr-8 border-[#FBFCFB]/30 focus-visible:ring-[#FBFCFB]/30"
                    autoFocus
                    onBlur={() => setTimeout(() => setSearchVisible(false), 100)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 text-[#FBFCFB]"
                    onClick={toggleSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="icon" className="text-[#FBFCFB]" onClick={toggleSearch}>
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>
            
            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8 ring-2 ring-offset-2 ring-[#FBFCFB]/20">
                    <AvatarImage src={auth?.user?.avatar_url} alt={auth?.user?.username} />
                    <AvatarFallback className="bg-[#FBFCFB]/10 text-[#FBFCFB]">{auth?.user?.firstName?.charAt(0)}{auth?.user?.lastName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-primary-200">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{auth?.user?.firstName} {auth?.user?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{auth?.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary-100" />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer w-full hover:bg-primary-50 hover:text-primary-700 focus:bg-primary-50 focus:text-primary-700">
                      <UserCircle className="h-4 w-4 mr-2" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer w-full hover:bg-primary-50 hover:text-primary-700 focus:bg-primary-50 focus:text-primary-700">
                      <Settings className="h-4 w-4 mr-2" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-primary-100" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#FBFCFB]/20 bg-[#448460]">
          <nav className="container py-3 flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center py-2 px-3 rounded-md text-[#FBFCFB] hover:bg-[#FBFCFB]/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            <div className="relative pt-2">
              <Input type="search" placeholder="Search..." className="border-[#FBFCFB]/30 focus-visible:ring-[#FBFCFB]/30 bg-[#FBFCFB]/10 text-[#FBFCFB] placeholder:text-[#FBFCFB]/60" />
            </div>
          </nav>
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-1 container py-6">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="border-t border-primary-200 py-6 bg-primary-50">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-4 text-sm order-3 md:order-1">
              <Link to="/terms" className="text-primary-600 hover:text-primary-800">
                Terms
              </Link>
              <Link to="/privacy" className="text-primary-600 hover:text-primary-800">
                Privacy
              </Link>
              <Link to="/contact" className="text-primary-600 hover:text-primary-800">
                Contact
              </Link>
              <Link to="/data-removal" className="text-primary-600 hover:text-primary-800">
                Data Removal
              </Link>
            </div>
            <div className="text-sm text-primary-700 order-2">
              {BRAND.copyright}
            </div>
            <div className="flex items-center gap-2 text-primary-600 order-1 md:order-3">
              <Logo variant="greenMono" size="sm" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 