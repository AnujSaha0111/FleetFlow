import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Slider,
  Typography,
  Box,
} from "@mui/material";
import { Save, Close } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { addDriver, updateDriver } from "../../store/slices/driversSlice";
import { Driver, DriverDutyStatus } from "../../types";

interface DriverFormDialogProps {
  open: boolean;
  driver: Driver | null;
  onClose: () => void;
}

interface FormData {
  name: string;
  licenseNumber: string;
  licenseExpiry: string;
  safetyScore: number;
  dutyStatus: DriverDutyStatus;
  phone: string;
}

interface FormErrors {
  name?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  phone?: string;
}

const DriverFormDialog: React.FC<DriverFormDialogProps> = ({
  open,
  driver,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.drivers);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    licenseNumber: "",
    licenseExpiry: "",
    safetyScore: 100,
    dutyStatus: "available",
    phone: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Populate form when editing
  useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.name,
        licenseNumber: driver.licenseNumber,
        licenseExpiry: driver.licenseExpiry,
        safetyScore: driver.safetyScore,
        dutyStatus: driver.dutyStatus,
        phone: driver.phone || "",
      });
    } else {
      // Reset form for new driver
      setFormData({
        name: "",
        licenseNumber: "",
        licenseExpiry: "",
        safetyScore: 100,
        dutyStatus: "available",
        phone: "",
      });
    }
    setErrors({});
  }, [driver, open]);

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Driver name is required";
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = "License number is required";
    }

    if (!formData.licenseExpiry) {
      newErrors.licenseExpiry = "License expiry date is required";
    } else if (new Date(formData.licenseExpiry) < new Date()) {
      newErrors.licenseExpiry = "License expiry date cannot be in the past";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const phoneValue = formData.phone.trim();
    const driverData = {
      name: formData.name.trim(),
      licenseNumber: formData.licenseNumber.trim().toUpperCase(),
      licenseExpiry: formData.licenseExpiry,
      safetyScore: formData.safetyScore,
      dutyStatus: formData.dutyStatus,
      phone: phoneValue ? phoneValue : undefined,
    };

    try {
      if (driver) {
        // Update existing driver
        await dispatch(
          updateDriver({ id: driver.id, updates: driverData }),
        ).unwrap();
      } else {
        // Add new driver
        await dispatch(addDriver(driverData)).unwrap();
      }
      onClose();
    } catch (error) {
      console.error("Failed to save driver:", error);
    }
  };

  const getSafetyScoreColor = (score: number): string => {
    if (score >= 80) return "success.main";
    if (score >= 60) return "warning.main";
    return "error.main";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          fontWeight: 700,
        }}
      >
        {driver ? "Edit Driver" : "Add New Driver"}
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Driver Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              placeholder="e.g., John Doe"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="License Number"
              fullWidth
              required
              value={formData.licenseNumber}
              onChange={(e) =>
                handleChange("licenseNumber", e.target.value.toUpperCase())
              }
              error={!!errors.licenseNumber}
              helperText={errors.licenseNumber}
              placeholder="e.g., DL-1234567890"
              inputProps={{ style: { textTransform: "uppercase" } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="License Expiry Date"
              fullWidth
              required
              type="date"
              value={formData.licenseExpiry}
              onChange={(e) => handleChange("licenseExpiry", e.target.value)}
              error={!!errors.licenseExpiry}
              helperText={errors.licenseExpiry}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Duty Status</InputLabel>
              <Select
                value={formData.dutyStatus}
                label="Duty Status"
                onChange={(e) => handleChange("dutyStatus", e.target.value)}
              >
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="on-trip">On Trip</MenuItem>
                <MenuItem value="off-duty">Off Duty</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Phone Number (Optional)"
              fullWidth
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              error={!!errors.phone}
              helperText={errors.phone}
              placeholder="e.g., +1 234 567 8900"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Safety Score
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Slider
                  value={formData.safetyScore}
                  onChange={(_, value) =>
                    handleChange("safetyScore", value as number)
                  }
                  min={0}
                  max={100}
                  step={5}
                  marks={[
                    { value: 0, label: "0" },
                    { value: 50, label: "50" },
                    { value: 100, label: "100" },
                  ]}
                  sx={{
                    flexGrow: 1,
                    "& .MuiSlider-thumb": {
                      bgcolor: getSafetyScoreColor(formData.safetyScore),
                    },
                    "& .MuiSlider-track": {
                      bgcolor: getSafetyScoreColor(formData.safetyScore),
                    },
                    "& .MuiSlider-rail": {
                      bgcolor: "grey.300",
                    },
                  }}
                />
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    minWidth: 40,
                    color: getSafetyScoreColor(formData.safetyScore),
                  }}
                >
                  {formData.safetyScore}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {!driver && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Driver will be created with status "
                <strong>{formData.dutyStatus}</strong>" and safety score of{" "}
                <strong>{formData.safetyScore}</strong>
              </Alert>
            </Grid>
          )}

          {formData.licenseExpiry &&
            new Date(formData.licenseExpiry) < new Date() && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  ⚠️ <strong>Warning:</strong> This license has expired! Driver
                  cannot be assigned to trips.
                </Alert>
              </Grid>
            )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: "grey.50" }}>
        <Button onClick={onClose} startIcon={<Close />} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<Save />}
          disabled={loading}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
          }}
        >
          {driver ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DriverFormDialog;
