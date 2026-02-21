import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useAppSelector } from "../../store/hooks";
import type { FuelLog } from "../../types";

interface FuelLogFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (fuelLogData: Omit<FuelLog, "id" | "createdAt">) => void;
  fuelLog?: FuelLog | null;
}

interface FormData {
  vehicleId: string;
  date: Date;
  liters: string;
  costPerLiter: string;
  odometer: string;
}

interface FormErrors {
  vehicleId?: string;
  date?: string;
  liters?: string;
  costPerLiter?: string;
  odometer?: string;
}

export default function FuelLogFormDialog({
  open,
  onClose,
  onSubmit,
  fuelLog,
}: FuelLogFormDialogProps) {
  const vehicles = useAppSelector((state) => state.vehicles.vehicles);

  const [formData, setFormData] = useState<FormData>({
    vehicleId: "",
    date: new Date(),
    liters: "",
    costPerLiter: "",
    odometer: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (fuelLog) {
      setFormData({
        vehicleId: fuelLog.vehicleId,
        date: new Date(fuelLog.date),
        liters: fuelLog.liters.toString(),
        costPerLiter: fuelLog.costPerLiter.toString(),
        odometer: fuelLog.odometer.toString(),
      });
    } else {
      setFormData({
        vehicleId: "",
        date: new Date(),
        liters: "",
        costPerLiter: "",
        odometer: "",
      });
    }
    setErrors({});
  }, [fuelLog, open]);

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.vehicleId.trim()) {
      newErrors.vehicleId = "Please select a vehicle";
      isValid = false;
    }

    if (!formData.liters.trim()) {
      newErrors.liters = "Liters is required";
      isValid = false;
    } else {
      const liters = parseFloat(formData.liters);
      if (isNaN(liters) || liters <= 0) {
        newErrors.liters = "Please enter a valid quantity";
        isValid = false;
      }
    }

    if (!formData.costPerLiter.trim()) {
      newErrors.costPerLiter = "Cost per liter is required";
      isValid = false;
    } else {
      const cost = parseFloat(formData.costPerLiter);
      if (isNaN(cost) || cost <= 0) {
        newErrors.costPerLiter = "Please enter a valid cost";
        isValid = false;
      }
    }

    if (!formData.odometer.trim()) {
      newErrors.odometer = "Odometer reading is required";
      isValid = false;
    } else {
      const odo = parseFloat(formData.odometer);
      if (isNaN(odo) || odo < 0) {
        newErrors.odometer = "Please enter a valid odometer reading";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const liters = parseFloat(formData.liters);
    const costPerLiter = parseFloat(formData.costPerLiter);
    const totalCost = liters * costPerLiter;

    const fuelLogData: Omit<FuelLog, "id" | "createdAt"> = {
      vehicleId: formData.vehicleId,
      date: formData.date.toISOString(),
      liters,
      costPerLiter,
      totalCost,
      odometer: parseFloat(formData.odometer),
    };

    onSubmit(fuelLogData);
  };

  const selectedVehicle = vehicles.find((v) => v.id === formData.vehicleId);
  const totalCost =
    formData.liters && formData.costPerLiter
      ? (
          parseFloat(formData.liters) * parseFloat(formData.costPerLiter)
        ).toFixed(2)
      : "0.00";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          color: "white",
          fontWeight: 600,
        }}
      >
        {fuelLog ? "Edit Fuel Log" : "Add Fuel Log"}
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2.5}>
            {/* Vehicle Selection */}
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                label="Select Vehicle"
                fullWidth
                required
                value={formData.vehicleId}
                onChange={(e) => handleChange("vehicleId", e.target.value)}
                error={!!errors.vehicleId}
                helperText={errors.vehicleId}
                disabled={!!fuelLog}
              >
                {vehicles.length === 0 ? (
                  <MenuItem disabled>No vehicles available</MenuItem>
                ) : (
                  vehicles.map((vehicle) => (
                    <MenuItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} - {vehicle.licensePlate}
                    </MenuItem>
                  ))
                )}
              </TextField>
              {selectedVehicle && (
                <Box
                  sx={{ mt: 1, p: 1, bgcolor: "info.lighter", borderRadius: 1 }}
                >
                  <Typography variant="caption" color="info.dark">
                    Current Odometer:{" "}
                    {selectedVehicle.currentOdometer.toLocaleString()} km
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Date */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label="Fuel Date"
                value={formData.date}
                onChange={(newValue: Date | null) =>
                  handleChange("date", newValue || new Date())
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.date,
                    helperText: errors.date,
                  },
                }}
              />
            </Grid>

            {/* Odometer */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Odometer Reading (km)"
                type="number"
                fullWidth
                required
                value={formData.odometer}
                onChange={(e) => handleChange("odometer", e.target.value)}
                error={!!errors.odometer}
                helperText={
                  errors.odometer ||
                  (selectedVehicle
                    ? `Current: ${selectedVehicle.currentOdometer.toLocaleString()} km`
                    : "")
                }
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>

            {/* Liters */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Quantity (Liters)"
                type="number"
                fullWidth
                required
                value={formData.liters}
                onChange={(e) => handleChange("liters", e.target.value)}
                error={!!errors.liters}
                helperText={errors.liters}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            {/* Cost Per Liter */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Cost Per Liter (₹)"
                type="number"
                fullWidth
                required
                value={formData.costPerLiter}
                onChange={(e) => handleChange("costPerLiter", e.target.value)}
                error={!!errors.costPerLiter}
                helperText={errors.costPerLiter}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            {/* Total Cost Display */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ p: 2, bgcolor: "success.lighter", borderRadius: 1 }}>
                <Typography
                  variant="body2"
                  color="success.dark"
                  fontWeight={600}
                >
                  Total Cost: ₹{totalCost}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {fuelLog ? "Update Log" : "Add Log"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
