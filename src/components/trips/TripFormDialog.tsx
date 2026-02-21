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
  Alert,
  Box,
  Typography,
} from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useAppSelector } from "../../store/hooks";
import type { Trip } from "../../types";

interface TripFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (tripData: Omit<Trip, "id" | "createdAt" | "updatedAt">) => void;
  trip?: Trip | null;
}

interface FormData {
  vehicleId: string;
  driverId: string;
  origin: string;
  destination: string;
  cargoWeight: string;
  cargoDescription: string;
  departureDate: Date;
  estimatedArrival: Date;
  revenue: string;
}

interface FormErrors {
  vehicleId?: string;
  driverId?: string;
  origin?: string;
  destination?: string;
  cargoWeight?: string;
  cargoDescription?: string;
  departureDate?: string;
  estimatedArrival?: string;
}

export default function TripFormDialog({
  open,
  onClose,
  onSubmit,
  trip,
}: TripFormDialogProps) {
  const vehicles = useAppSelector((state) => state.vehicles.vehicles);
  const drivers = useAppSelector((state) => state.drivers.drivers);

  const [formData, setFormData] = useState<FormData>({
    vehicleId: "",
    driverId: "",
    origin: "",
    destination: "",
    cargoWeight: "",
    cargoDescription: "",
    departureDate: new Date(),
    estimatedArrival: new Date(Date.now() + 24 * 60 * 60 * 1000), // +1 day
    revenue: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [validationWarning, setValidationWarning] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (trip) {
      setFormData({
        vehicleId: trip.vehicleId,
        driverId: trip.driverId,
        origin: trip.origin,
        destination: trip.destination,
        cargoWeight: trip.cargoWeight.toString(),
        cargoDescription: trip.cargoDescription,
        departureDate: new Date(trip.departureDate),
        estimatedArrival: new Date(trip.estimatedArrival),
        revenue: trip.revenue?.toString() || "",
      });
    } else {
      setFormData({
        vehicleId: "",
        driverId: "",
        origin: "",
        destination: "",
        cargoWeight: "",
        cargoDescription: "",
        departureDate: new Date(),
        estimatedArrival: new Date(Date.now() + 24 * 60 * 60 * 1000),
        revenue: "",
      });
    }
    setErrors({});
    setValidationWarning(null);
  }, [trip, open]);

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setValidationWarning(null);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Required fields
    if (!formData.vehicleId.trim()) {
      newErrors.vehicleId = "Please select a vehicle";
      isValid = false;
    }

    if (!formData.driverId.trim()) {
      newErrors.driverId = "Please select a driver";
      isValid = false;
    }

    if (!formData.origin.trim()) {
      newErrors.origin = "Origin is required";
      isValid = false;
    }

    if (!formData.destination.trim()) {
      newErrors.destination = "Destination is required";
      isValid = false;
    }

    if (!formData.cargoWeight.trim()) {
      newErrors.cargoWeight = "Cargo weight is required";
      isValid = false;
    } else {
      const weight = parseFloat(formData.cargoWeight);
      if (isNaN(weight) || weight <= 0) {
        newErrors.cargoWeight = "Please enter a valid weight";
        isValid = false;
      }
    }

    if (!formData.cargoDescription.trim()) {
      newErrors.cargoDescription = "Cargo description is required";
      isValid = false;
    }

    // Date validation
    if (formData.departureDate >= formData.estimatedArrival) {
      newErrors.estimatedArrival = "Estimated arrival must be after departure";
      isValid = false;
    }

    setErrors(newErrors);

    // Business logic validation (only if basic validation passes)
    if (isValid) {
      // Check vehicle capacity
      const selectedVehicle = vehicles.find((v) => v.id === formData.vehicleId);
      if (selectedVehicle) {
        const cargoWeight = parseFloat(formData.cargoWeight);
        if (cargoWeight > selectedVehicle.maxLoadCapacity) {
          setValidationWarning(
            `⚠️ CRITICAL: Cargo weight (${cargoWeight} kg) exceeds vehicle capacity (${selectedVehicle.maxLoadCapacity} kg). Please select a different vehicle or reduce cargo weight.`,
          );
          return false;
        }

        // Check vehicle availability
        if (selectedVehicle.status !== "available" && !trip) {
          setValidationWarning(
            `⚠️ Vehicle "${selectedVehicle.name}" is currently ${selectedVehicle.status.replace("-", " ")}. Please select an available vehicle.`,
          );
          return false;
        }
      }

      // Check driver license expiry
      const selectedDriver = drivers.find((d) => d.id === formData.driverId);
      if (selectedDriver) {
        const licenseExpiry = new Date(selectedDriver.licenseExpiry);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (licenseExpiry < today) {
          setValidationWarning(
            `⚠️ CRITICAL: Driver "${selectedDriver.name}" has an expired license (expired on ${new Date(
              selectedDriver.licenseExpiry,
            ).toLocaleDateString()}). Cannot assign to trip.`,
          );
          return false;
        }

        // Check driver availability
        if (selectedDriver.dutyStatus !== "available" && !trip) {
          setValidationWarning(
            `⚠️ Driver "${selectedDriver.name}" is currently ${selectedDriver.dutyStatus.replace("-", " ")}. Please select an available driver.`,
          );
          return false;
        }
      }
    }

    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const selectedVehicle = vehicles.find((v) => v.id === formData.vehicleId);
    if (!selectedVehicle) return;

    const revenueValue = formData.revenue.trim()
      ? parseFloat(formData.revenue)
      : undefined;

    const tripData: Omit<Trip, "id" | "createdAt" | "updatedAt"> = {
      vehicleId: formData.vehicleId,
      driverId: formData.driverId,
      origin: formData.origin.trim(),
      destination: formData.destination.trim(),
      cargoWeight: parseFloat(formData.cargoWeight),
      cargoDescription: formData.cargoDescription.trim(),
      departureDate: formData.departureDate.toISOString(),
      estimatedArrival: formData.estimatedArrival.toISOString(),
      startOdometer: selectedVehicle.currentOdometer,
      status: "active",
      revenue: revenueValue,
    };

    onSubmit(tripData);
  };

  // Get available vehicles (only for new trips)
  const availableVehicles = trip
    ? vehicles
    : vehicles.filter(
        (v) => v.status === "available" || v.id === formData.vehicleId,
      );

  // Get available drivers (only for new trips)
  const availableDrivers = trip
    ? drivers
    : drivers.filter((d) => {
        // Check license expiry
        const licenseExpiry = new Date(d.licenseExpiry);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isLicenseValid = licenseExpiry >= today;

        return (
          (isLicenseValid && d.dutyStatus === "available") ||
          d.id === formData.driverId
        );
      });

  const selectedVehicle = vehicles.find((v) => v.id === formData.vehicleId);
  const selectedDriver = drivers.find((d) => d.id === formData.driverId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          fontWeight: 600,
        }}
      >
        {trip ? "Edit Trip" : "Create New Trip"}
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          {validationWarning && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {validationWarning}
            </Alert>
          )}

          <Grid container spacing={2.5}>
            {/* Vehicle Selection */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Select Vehicle"
                fullWidth
                required
                value={formData.vehicleId}
                onChange={(e) => handleChange("vehicleId", e.target.value)}
                error={!!errors.vehicleId}
                helperText={errors.vehicleId}
                disabled={!!trip}
              >
                {availableVehicles.length === 0 ? (
                  <MenuItem disabled>No available vehicles</MenuItem>
                ) : (
                  availableVehicles.map((vehicle) => (
                    <MenuItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} - {vehicle.licensePlate} (Max:{" "}
                      {vehicle.maxLoadCapacity} kg)
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

            {/* Driver Selection */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Select Driver"
                fullWidth
                required
                value={formData.driverId}
                onChange={(e) => handleChange("driverId", e.target.value)}
                error={!!errors.driverId}
                helperText={errors.driverId}
                disabled={!!trip}
              >
                {availableDrivers.length === 0 ? (
                  <MenuItem disabled>No available drivers</MenuItem>
                ) : (
                  availableDrivers.map((driver) => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.name} - {driver.licenseNumber} (Safety:{" "}
                      {driver.safetyScore}/100)
                    </MenuItem>
                  ))
                )}
              </TextField>
              {selectedDriver && (
                <Box
                  sx={{
                    mt: 1,
                    p: 1,
                    bgcolor: "success.lighter",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption" color="success.dark">
                    License Valid Until:{" "}
                    {new Date(
                      selectedDriver.licenseExpiry,
                    ).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Origin */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Origin"
                fullWidth
                required
                value={formData.origin}
                onChange={(e) => handleChange("origin", e.target.value)}
                error={!!errors.origin}
                helperText={errors.origin}
                placeholder="e.g., Mumbai Warehouse"
              />
            </Grid>

            {/* Destination */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Destination"
                fullWidth
                required
                value={formData.destination}
                onChange={(e) => handleChange("destination", e.target.value)}
                error={!!errors.destination}
                helperText={errors.destination}
                placeholder="e.g., Delhi Distribution Center"
              />
            </Grid>

            {/* Cargo Weight */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Cargo Weight (kg)"
                type="number"
                fullWidth
                required
                value={formData.cargoWeight}
                onChange={(e) => handleChange("cargoWeight", e.target.value)}
                error={!!errors.cargoWeight}
                helperText={
                  errors.cargoWeight ||
                  (selectedVehicle
                    ? `Max capacity: ${selectedVehicle.maxLoadCapacity} kg`
                    : "")
                }
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            {/* Revenue */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Expected Revenue (₹)"
                type="number"
                fullWidth
                value={formData.revenue}
                onChange={(e) => handleChange("revenue", e.target.value)}
                placeholder="Optional"
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            {/* Cargo Description */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Cargo Description"
                fullWidth
                required
                multiline
                rows={2}
                value={formData.cargoDescription}
                onChange={(e) =>
                  handleChange("cargoDescription", e.target.value)
                }
                error={!!errors.cargoDescription}
                helperText={errors.cargoDescription}
                placeholder="Describe the cargo being transported..."
              />
            </Grid>

            {/* Departure Date */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <DateTimePicker
                label="Departure Date & Time"
                value={formData.departureDate}
                onChange={(newValue: Date | null) =>
                  handleChange("departureDate", newValue || new Date())
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.departureDate,
                    helperText: errors.departureDate,
                  },
                }}
              />
            </Grid>

            {/* Estimated Arrival */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <DateTimePicker
                label="Estimated Arrival"
                value={formData.estimatedArrival}
                onChange={(newValue: Date | null) =>
                  handleChange("estimatedArrival", newValue || new Date())
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.estimatedArrival,
                    helperText: errors.estimatedArrival,
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
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {trip ? "Update Trip" : "Create Trip"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
