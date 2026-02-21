import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";
import { keyframes } from "@mui/system";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: SvgIconComponent;
  color: string;
  loading?: boolean;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  loading,
  subtitle,
}) => {
  return (
    <Card
      sx={{
        height: "100%",
        background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        animation: `${fadeIn} 0.5s ease-out`,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: `linear-gradient(90deg, ${color}, ${color}dd)`,
          opacity: 0,
          transition: "opacity 0.3s",
        },
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
          borderColor: color,
          "&::before": {
            opacity: 1,
          },
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="overline"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                letterSpacing: "0.5px",
                fontSize: "0.75rem",
              }}
            >
              {title}
            </Typography>
            {loading ? (
              <CircularProgress size={28} sx={{ my: 2 }} />
            ) : (
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mt: 1,
                  mb: 0.5,
                  background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: loading
                    ? "none"
                    : `${pulse} 2s ease-in-out infinite`,
                }}
              >
                {value}
              </Typography>
            )}
            {subtitle && (
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  display: "block",
                  mt: 1,
                  fontSize: "0.875rem",
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${color}, ${color}dd)`,
              borderRadius: 2.5,
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 8px 16px ${color}40`,
              transition: "all 0.3s",
              "&:hover": {
                transform: "rotate(10deg) scale(1.1)",
                boxShadow: `0 12px 24px ${color}60`,
              },
            }}
          >
            <Icon sx={{ fontSize: 36, color: "white" }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default KPICard;
