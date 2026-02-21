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
  InputAdornment,
} from "@mui/material";
import { Save, Close } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { addVehicle, updateVehicle } from "../../store/slices/vehiclesSlice";
import { Vehicle, VehicleStatus } from "../../types";

interface VehicleFormDialogProps {
  open: boolean;
  vehicle: Vehicle | null;
  onClose: () => void;
}

interface FormData {
  name: string;
  model: string;
  licensePlate: string;
  maxLoadCapacity: string;
  currentOdometer: string;
  acquisitionCost: string;
  status: VehicleStatus;
  notes: string;
}

interface FormErrors {
  name?: string;
  model?: string;
  licensePlate?: string;
  maxLoadCapacity?: string;
  currentOdometer?: string;
  acquisitionCost?: string;
}

const VehicleFormDialog: React.FC<VehicleFormDialogProps> = ({
  open,
  vehicle,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.vehicles);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    model: "",
    licensePlate: "",
    acquisitionCost: "",
    maxLoadCapacity: "",
    currentOdometer: "",
    status: "available",
    notes: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Populate form when editing
  useEffect(() => {
    if (vehicle) {
      setFormData({
        name: vehicle.name,
        model: vehicle.model,
        licensePlate: vehicle.licensePlate,
        maxLoadCapacity: vehicle.maxLoadCapacity.toString(),
        currentOdometer: vehicle.currentOdometer.toString(),
        acquisitionCost: vehicle.acquisitionCost.toString(),
        status: vehicle.status,
        notes: vehicle.notes || "",
      });
    } else {
      // Reset form for new vehicle
      setFormData({
        name: "",
        model: "",
        licensePlate: "",
        maxLoadCapacity: "",
        currentOdometer: "0",
        acquisitionCost: "",
        status: "available",
        notes: "",
      });
    }
    setErrors({});
  }, [vehicle, open]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Vehicle name is required";
    }

    if (!formData.model.trim()) {
      newErrors.model = "Model is required";
    }

    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = "License plate is required";
    }

    const maxCapacity = parseFloat(formData.maxLoadCapacity);
    if (!formData.maxLoadCapacity || isNaN(maxCapacity) || maxCapacity <= 0) {
      newErrors.maxLoadCapacity = "Valid max capacity is required";
    }

    const odometer = parseFloat(formData.currentOdometer);
    if (!formData.currentOdometer || isNaN(odometer) || odometer < 0) {
      const cost = parseFloat(formData.acquisitionCost);
      if (!formData.acquisitionCost || isNaN(cost) || cost < 0) {
        newErrors.acquisitionCost = "Valid acquisition cost is required";
      }

      newErrors.currentOdometer = "Valid odometer reading is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const vehicleData = {
      name: formData.name.trim(),
      model: formData.model.trim(),
      licensePlate: formData.licensePlate.trim().toUpperCase(),
      maxLoadCapacity: parseFloat(formData.maxLoadCapacity),
      currentOdometer: parseFloat(formData.currentOdometer),
      acquisitionCost: parseFloat(formData.acquisitionCost),
      status: formData.status,
      notes: formData.notes.trim() || null,
    };

    try {
      if (vehicle) {
        // Update existing vehicle
        await dispatch(
          updateVehicle({ id: vehicle.id, updates: vehicleData }),
        ).unwrap();
      } else {
        // Add new vehicle
        await dispatch(addVehicle(vehicleData)).unwrap();
      }
      onClose();
    } catch (error) {
      console.error("Failed to save vehicle:", error);
    }
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
        {vehicle ? "Edit Vehicle" : "Add New Vehicle"}
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Vehicle Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              placeholder="e.g., Truck Alpha"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Model"
              fullWidth
              required
              value={formData.model}
              onChange={(e) => handleChange("model", e.target.value)}
              error={!!errors.model}
              helperText={errors.model}
              placeholder="e.g., Toyota Hilux 2023"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="License Plate"
              fullWidth
              required
              value={formData.licensePlate}
              onChange={(e) =>
                handleChange("licensePlate", e.target.value.toUpperCase())
              }
              error={!!errors.licensePlate}
              helperText={errors.licensePlate}
              placeholder="e.g., ABC-1234"
              inputProps={{ style: { textTransform: "uppercase" } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="on-trip">On Trip</MenuItem>
                <MenuItem value="in-shop">In Shop</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Max Load Capacity"
              fullWidth
              required
              type="number"
              value={formData.maxLoadCapacity}
              onChange={(e) => handleChange("maxLoadCapacity", e.target.value)}
              error={!!errors.maxLoadCapacity}
              helperText={errors.maxLoadCapacity}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">kg</InputAdornment>
                ),
              }}
              inputProps={{ min: 0, step: 100 }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Acquisition Cost"
              fullWidth
              required
              type="number"
              value={formData.acquisitionCost}
              onChange={(e) => handleChange("acquisitionCost", e.target.value)}
              error={!!errors.acquisitionCost}
              helperText={errors.acquisitionCost}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              inputProps={{ min: 0, step: 1000 }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Current Odometer"
              fullWidth
              required
              type="number"
              value={formData.currentOdometer}
              onChange={(e) => handleChange("currentOdometer", e.target.value)}
              error={!!errors.currentOdometer}
              helperText={errors.currentOdometer}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">km</InputAdornment>
                ),
              }}
              inputProps={{ min: 0, step: 1 }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              label="Notes (Optional)"
              fullWidth
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional information about the vehicle..."
            />
          </Grid>

          {!vehicle && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Vehicle will be created with status "
                <strong>{formData.status}</strong>"
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
          {vehicle ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VehicleFormDialog;
