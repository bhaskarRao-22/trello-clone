import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Bars3CenterLeftIcon,
  XMarkIcon,
  HomeIcon,
  UsersIcon,
  CalendarDateRangeIcon,
  RectangleStackIcon,
  AdjustmentsVerticalIcon,
  ChevronUpDownIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isUsersMenuOpen, setIsUsersMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: HomeIcon },
    {
      name: "Users",
      icon: UsersIcon,
      subItems: [
        { name: "Link 1", path: "/users/1" },
        { name: "Link 2", path: "/users/2" },
      ],
    },
    { name: "Projects", path: "/projects", icon: RectangleStackIcon },
    { name: "Calendar", path: "/calendar", icon: CalendarDateRangeIcon },
    {
      name: "Monthly Summary",
      path: "/attendance/summary",
      icon: AdjustmentsVerticalIcon,
    },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Toggle Button - visible on mobile */}
      <div className="sm:hidden fixed top-2 left-2">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-gray-200/50 focus:outline-none"
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6 text-red-500 z-50" />
          ) : (
            <Bars3CenterLeftIcon className="h-6 w-6 text-gray-800" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 sm:top-16 left-0 h-[calc(100vh-0rem)] z-30  shadow transition-transform transform ${
          isOpen
            ? "translate-x-0 bg-red-100/30 backdrop-blur-sm"
            : "-translate-x-full bg-white"
        } sm:translate-x-0 sm:static sm:block w-64`}
      >
        <div className="h-full p-1 pb-0 flex flex-col">
          {/* Header */}
          <header className="pb-4 items-center gap-x-2">
            <div className="flex justify-between">
              <Link
                className="flex-none font-bold text-xl text-blue-700 focus:outline-hidden focus:opacity-80 dark:text-white "
                to="/dashboard"
                aria-label="Brand"
              >
                TRELLO-CLONE
              </Link>
              <button
                onClick={toggleSidebar}
                className={`p-1 rounded-md bg-gray-200/50 focus:outline-none sm:hidden`}
              >
                <XMarkIcon className="h-6 w-6 text-red-500" />
              </button>
            </div>
            <div className="flex flex-col items-center mt-6 -mx-2">
              <img
                alt=""
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                className="object-cover w-24 h-24 mx-2 rounded-full"
              />
              <h4 className="mx-2 mt-2 font-medium text-gray-800 dark:text-gray-200">
                {user.name || "User"}
              </h4>
              <p className="mx-2 mt-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                {user.email || "Email"}
              </p>
            </div>
          </header>
          {/* End Header */}

          {/* <nav className="flex flex-col gap-4"> */}
          <nav className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;

                if (item.subItems) {
                  return (
                    <li key={item.name} className="my-2">
                      <button
                        onClick={() => setIsUsersMenuOpen(!isUsersMenuOpen)}
                        className="flex items-center w-full gap-x-3.5 py-2 px-2.5 text-sm text-gray-800 rounded-lg bg-gray-200 hover:bg-gray-300 dark:text-white dark:hover:bg-neutral-700"
                      >
                        <Icon className="h-6 w-6" />
                        {item.name}
                        <ChevronDownIcon
                          className={`h-4 w-4 ml-auto transform transition-transform ${
                            isUsersMenuOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isUsersMenuOpen && (
                        <ul className="pt-1 pl-7 space-y-1">
                          {item.subItems.map((sub) => (
                            <li key={sub.name}>
                              <Link
                                to={sub.path}
                                className="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-800 rounded-lg bg-gray-200  hover:bg-gray-300 dark:text-white dark:hover:bg-neutral-700"
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={item.name} className="my-2">
                    <Link
                      to={item.path}
                      className={`flex items-center gap-x-3.5 py-2 px-2.5 text-sm rounded-lg ${
                        location.pathname === item.path
                          ? "bg-gray-300 text-blue-700 font-semibold"
                          : "text-gray-800 bg-gray-200 hover:bg-gray-300 dark:text-white dark:hover:bg-neutral-700"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <footer className="p-2 border-t border-gray-200">
            {/* Account Dropdown */}
            <div ref={accountRef} className="relative w-full inline-flex">
              <button
                type="button"
                onClick={() => setAccountOpen(!accountOpen)}
                className="w-full inline-flex shrink-0 items-center gap-x-2 p-2 text-start text-sm text-gray-800 rounded-md hover:bg-gray-100 focus:outline-hidden dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                <img
                  alt=""
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  className="size-8 rounded-full"
                />
                <span className="text-gray-700 font-medium">
                  {user.name || "User"}
                </span>
                <ChevronUpDownIcon className="h-5 w-5 ms-auto" />
              </button>

              {accountOpen && (
                <div
                  className="absolute bottom-12 w-60 z-20 bg-purple-200/30 backdrop-blur-sm border-2 border-gray-200 rounded-t-2xl shadow-lg dark:bg-neutral-900 dark:border-neutral-700"
                  role="menu"
                >
                  <div className="p-1">
                    <a
                      className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-200 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      href="#"
                    >
                      My account
                    </a>
                    <a
                      className="flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-200 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      href="#"
                    >
                      Settings
                    </a>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-200 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* End Account Dropdown */}
          </footer>
          {/* End Footer */}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
