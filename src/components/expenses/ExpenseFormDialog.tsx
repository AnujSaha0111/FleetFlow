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
import type { Expense, ExpenseCategory } from "../../types";

interface ExpenseFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (expenseData: Omit<Expense, "id" | "createdAt">) => void;
  expense?: Expense | null;
}

interface FormData {
  vehicleId: string;
  date: Date;
  category: ExpenseCategory;
  amount: string;
  description: string;
}

interface FormErrors {
  vehicleId?: string;
  date?: string;
  category?: string;
  amount?: string;
  description?: string;
}

const expenseCategories: {
  value: ExpenseCategory;
  label: string;
  icon: string;
}[] = [
  { value: "fuel", label: "Fuel", icon: "⛽" },
  { value: "maintenance", label: "Maintenance", icon: "🔧" },
  { value: "insurance", label: "Insurance", icon: "🛡️" },
  { value: "toll", label: "Toll", icon: "🛣️" },
  { value: "parking", label: "Parking", icon: "🅿️" },
  { value: "other", label: "Other", icon: "📝" },
];

export default function ExpenseFormDialog({
  open,
  onClose,
  onSubmit,
  expense,
}: ExpenseFormDialogProps) {
  const vehicles = useAppSelector((state) => state.vehicles.vehicles);

  const [formData, setFormData] = useState<FormData>({
    vehicleId: "",
    date: new Date(),
    category: "fuel",
    amount: "",
    description: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (expense) {
      setFormData({
        vehicleId: expense.vehicleId,
        date: new Date(expense.date),
        category: expense.category,
        amount: expense.amount.toString(),
        description: expense.description,
      });
    } else {
      setFormData({
        vehicleId: "",
        date: new Date(),
        category: "fuel",
        amount: "",
        description: "",
      });
    }
    setErrors({});
  }, [expense, open]);

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

    if (!formData.amount.trim()) {
      newErrors.amount = "Amount is required";
      isValid = false;
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = "Please enter a valid amount";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const expenseData: Omit<Expense, "id" | "createdAt"> = {
      vehicleId: formData.vehicleId,
      date: formData.date.toISOString(),
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description.trim(),
    };

    onSubmit(expenseData);
  };

  const selectedVehicle = vehicles.find((v) => v.id === formData.vehicleId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          fontWeight: 600,
        }}
      >
        {expense ? "Edit Expense" : "Add Expense"}
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
                disabled={!!expense}
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

            {/* Date */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label="Expense Date"
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

            {/* Category */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Category"
                fullWidth
                required
                value={formData.category}
                onChange={(e) =>
                  handleChange("category", e.target.value as ExpenseCategory)
                }
                error={!!errors.category}
                helperText={errors.category}
              >
                {expenseCategories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Amount */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Amount (₹)"
                type="number"
                fullWidth
                required
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                error={!!errors.amount}
                helperText={errors.amount}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

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
                placeholder="Describe the expense..."
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
          {expense ? "Update Expense" : "Add Expense"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
