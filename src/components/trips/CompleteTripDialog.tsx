import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Alert,
  Box,
  Typography,
} from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import type { Trip } from "../../types";

interface CompleteTripDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: (endOdometer: number, actualArrival: string) => void;
  trip: Trip | null;
  vehicleCurrentOdometer: number;
}

interface FormData {
  endOdometer: string;
  actualArrival: Date;
}

interface FormErrors {
  endOdometer?: string;
  actualArrival?: string;
}

export default function CompleteTripDialog({
  open,
  onClose,
  onComplete,
  trip,
  vehicleCurrentOdometer,
}: CompleteTripDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    endOdometer: "",
    actualArrival: new Date(),
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (trip && open) {
      setFormData({
        endOdometer: vehicleCurrentOdometer.toString(),
        actualArrival: new Date(),
      });
      setErrors({});
    }
  }, [trip, open, vehicleCurrentOdometer]);

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.endOdometer.trim()) {
      newErrors.endOdometer = "End odometer reading is required";
      isValid = false;
    } else {
      const endOdo = parseFloat(formData.endOdometer);
      if (isNaN(endOdo) || endOdo < 0) {
        newErrors.endOdometer = "Please enter a valid odometer reading";
        isValid = false;
      } else if (trip && endOdo < trip.startOdometer) {
        newErrors.endOdometer = `End odometer (${endOdo} km) cannot be less than start odometer (${trip.startOdometer} km)`;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const endOdometer = parseFloat(formData.endOdometer);
    const actualArrival = formData.actualArrival.toISOString();

    onComplete(endOdometer, actualArrival);
  };

  if (!trip) return null;

  const distance = formData.endOdometer
    ? parseFloat(formData.endOdometer) - trip.startOdometer
    : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
          color: "white",
          fontWeight: 600,
        }}
      >
        Complete Trip
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Completing this trip will update the vehicle odometer and change the
            vehicle and driver status back to "Available".
          </Alert>

          {/* Trip Summary */}
          <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Trip Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Route:</strong> {trip.origin} → {trip.destination}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Start Odometer:</strong>{" "}
              {trip.startOdometer.toLocaleString()} km
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Departure:</strong>{" "}
              {new Date(trip.departureDate).toLocaleString()}
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {/* End Odometer */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="End Odometer Reading (km)"
                type="number"
                fullWidth
                required
                value={formData.endOdometer}
                onChange={(e) => handleChange("endOdometer", e.target.value)}
                error={!!errors.endOdometer}
                helperText={
                  errors.endOdometer ||
                  `Start odometer: ${trip.startOdometer.toLocaleString()} km`
                }
                inputProps={{ min: trip.startOdometer, step: 0.1 }}
              />
            </Grid>

            {/* Distance Traveled */}
            {distance > 0 && (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ p: 2, bgcolor: "success.lighter", borderRadius: 1 }}>
                  <Typography
                    variant="body2"
                    color="success.dark"
                    fontWeight={600}
                  >
                    Distance Traveled: {distance.toLocaleString()} km
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Actual Arrival */}
            <Grid size={{ xs: 12 }}>
              <DateTimePicker
                label="Actual Arrival Date & Time"
                value={formData.actualArrival}
                onChange={(newValue: Date | null) =>
                  handleChange("actualArrival", newValue || new Date())
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.actualArrival,
                    helperText: errors.actualArrival,
                  },
                }}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="success">
          Complete Trip
        </Button>
      </DialogActions>
    </Dialog>
  );
}
