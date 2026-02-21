import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Avatar,
} from "@mui/material";
import { Menu as MenuIcon, LocalShipping, Logout } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutUser } from "../../store/slices/authSlice";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
      }}
    >
      <Toolbar sx={{ py: 0.5 }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <LocalShipping sx={{ mr: 1.5, fontSize: 32 }} />
        <Typography
          variant="h5"
          noWrap
          component="div"
          sx={{
            flexGrow: 0,
            mr: 4,
            fontWeight: 700,
            letterSpacing: "-0.5px",
          }}
        >
          FleetFlow
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              bgcolor: "rgba(255,255,255,0.15)",
              borderRadius: 3,
              px: 2,
              py: 0.75,
              backdropFilter: "blur(10px)",
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "white",
                color: "primary.main",
                fontWeight: 700,
              }}
            >
              {user?.email.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, fontSize: "0.875rem" }}
              >
                {user?.email}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  textTransform: "capitalize",
                  opacity: 0.9,
                  fontSize: "0.75rem",
                }}
              >
                {user?.role}
              </Typography>
            </Box>
          </Box>

          <Button
            color="inherit"
            startIcon={<Logout />}
            onClick={handleLogout}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              borderRadius: 2,
              px: 2,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.3)",
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
