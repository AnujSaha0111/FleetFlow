import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { Warning, Close, Delete } from "@mui/icons-material";

interface DeleteConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Warning sx={{ color: "error.main", fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography color="text.secondary">{message}</Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: "grey.50" }}>
        <Button onClick={onCancel} startIcon={<Close />}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          startIcon={<Delete />}
          color="error"
          sx={{
            boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)",
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
