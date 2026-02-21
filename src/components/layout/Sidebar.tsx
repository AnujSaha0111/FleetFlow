import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
} from "@mui/material";
import {
  Dashboard,
  DirectionsCar,
  LocalShipping,
  Build,
  LocalGasStation,
  Person,
  Analytics,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";

const drawerWidth = 240;

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
  { text: "Vehicles", icon: <DirectionsCar />, path: "/vehicles" },
  { text: "Drivers", icon: <Person />, path: "/drivers" },
  { text: "Trip Dispatcher", icon: <LocalShipping />, path: "/trips" },
  { text: "Maintenance", icon: <Build />, path: "/maintenance" },
  { text: "Fuel & Expenses", icon: <LocalGasStation />, path: "/expenses" },
  {
    text: "Analytics",
    icon: <Analytics />,
    path: "/analytics",
    roles: ["manager"],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const drawer = (
    <Box>
      <Toolbar />
      <Divider />
      <List sx={{ px: 1.5, py: 2 }}>
        {menuItems.map((item) => {
          // Filter menu items based on user role
          if (item.roles && user && !item.roles.includes(user.role)) {
            return null;
          }

          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  transition: "all 0.2s",
                  "&.Mui-selected": {
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "white",
                    },
                  },
                  "&:hover": {
                    bgcolor: isActive ? undefined : "action.hover",
                    transform: "translateX(4px)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "white" : "primary.main",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: "0.9rem",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
