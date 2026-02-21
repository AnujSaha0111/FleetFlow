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
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useAppSelector } from "../../store/hooks";
import type {
  Maintenance,
  MaintenanceType,
  MaintenanceStatus,
} from "../../types";

interface MaintenanceFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    maintenanceData: Omit<Maintenance, "id" | "createdAt" | "updatedAt">,
  ) => void;
  maintenance?: Maintenance | null;
}

interface FormData {
  vehicleId: string;
  date: Date;
  type: MaintenanceType;
  description: string;
  cost: string;
  status: MaintenanceStatus;
  completedDate: Date | null;
}

interface FormErrors {
  vehicleId?: string;
  date?: string;
  type?: string;
  description?: string;
  cost?: string;
  status?: string;
}

const maintenanceTypes: { value: MaintenanceType; label: string }[] = [
  { value: "preventive", label: "Preventive Maintenance" },
  { value: "repair", label: "Repair" },
  { value: "inspection", label: "Inspection" },
  { value: "other", label: "Other" },
];

const maintenanceStatuses: { value: MaintenanceStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export default function MaintenanceFormDialog({
  open,
  onClose,
  onSubmit,
  maintenance,
}: MaintenanceFormDialogProps) {
  const vehicles = useAppSelector((state) => state.vehicles.vehicles);

  const [formData, setFormData] = useState<FormData>({
    vehicleId: "",
    date: new Date(),
    type: "preventive",
    description: "",
    cost: "",
    status: "pending",
    completedDate: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (maintenance) {
      setFormData({
        vehicleId: maintenance.vehicleId,
        date: new Date(maintenance.date),
        type: maintenance.type,
        description: maintenance.description,
        cost: maintenance.cost.toString(),
        status: maintenance.status,
        completedDate: maintenance.completedDate
          ? new Date(maintenance.completedDate)
          : null,
      });
    } else {
      setFormData({
        vehicleId: "",
        date: new Date(),
        type: "preventive",
        description: "",
        cost: "",
        status: "pending",
        completedDate: null,
      });
    }
    setErrors({});
  }, [maintenance, open]);

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

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    }

    if (!formData.cost.trim()) {
      newErrors.cost = "Cost is required";
      isValid = false;
    } else {
      const cost = parseFloat(formData.cost);
      if (isNaN(cost) || cost < 0) {
        newErrors.cost = "Please enter a valid cost";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const completedDateValue = formData.completedDate
      ? formData.completedDate.toISOString()
      : undefined;

    const maintenanceData: Omit<Maintenance, "id" | "createdAt" | "updatedAt"> =
      {
        vehicleId: formData.vehicleId,
        date: formData.date.toISOString(),
        type: formData.type,
        description: formData.description.trim(),
        cost: parseFloat(formData.cost),
        status: formData.status,
        completedDate: completedDateValue,
      };

    onSubmit(maintenanceData);
  };

  const selectedVehicle = vehicles.find((v) => v.id === formData.vehicleId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          color: "white",
          fontWeight: 600,
        }}
      >
        {maintenance ? "Edit Maintenance Record" : "Add Maintenance Record"}
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          {formData.status === "in-progress" && !maintenance && (
            <Alert severity="info" sx={{ mb: 2 }}>
              ⚠️ Setting status to "In Progress" will automatically change the
              vehicle status to "In Shop".
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
                disabled={!!maintenance}
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
                    Current Status:{" "}
                    {selectedVehicle.status.replace("-", " ").toUpperCase()}
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Maintenance Date */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label="Maintenance Date"
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

            {/* Maintenance Type */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Maintenance Type"
                fullWidth
                required
                value={formData.type}
                onChange={(e) =>
                  handleChange("type", e.target.value as MaintenanceType)
                }
                error={!!errors.type}
                helperText={errors.type}
              >
                {maintenanceTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Status */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Status"
                fullWidth
                required
                value={formData.status}
                onChange={(e) =>
                  handleChange("status", e.target.value as MaintenanceStatus)
                }
                error={!!errors.status}
                helperText={errors.status}
              >
                {maintenanceStatuses.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Cost */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Cost (₹)"
                type="number"
                fullWidth
                required
                value={formData.cost}
                onChange={(e) => handleChange("cost", e.target.value)}
                error={!!errors.cost}
                helperText={errors.cost}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            {/* Completed Date (only if status is completed) */}
            {formData.status === "completed" && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="Completed Date"
                  value={formData.completedDate}
                  onChange={(newValue: Date | null) =>
                    handleChange("completedDate", newValue)
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      placeholder: "Optional",
                    },
                  }}
                />
              </Grid>
            )}

            {/* Description */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description"
                fullWidth
                required
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                placeholder="Describe the maintenance work..."
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
          {maintenance ? "Update Record" : "Add Record"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
