import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  MenuItem,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalGasStation as FuelIcon,
  Receipt as ExpenseIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchFuelLogs,
  addFuelLog,
  updateFuelLog,
  deleteFuelLog,
} from "../store/slices/fuelLogsSlice";
import {
  fetchExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} from "../store/slices/expensesSlice";
import { fetchVehicles, updateVehicle } from "../store/slices/vehiclesSlice";
import FuelLogFormDialog from "../components/expenses/FuelLogFormDialog";
import ExpenseFormDialog from "../components/expenses/ExpenseFormDialog";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";
import type { FuelLog, Expense, ExpenseCategory } from "../types";

export default function FuelExpenses() {
  const dispatch = useAppDispatch();
  const { fuelLogs } = useAppSelector((state) => state.fuelLogs);
  const { expenses } = useAppSelector((state) => state.expenses);
  const vehicles = useAppSelector((state) => state.vehicles.vehicles);

  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "all">(
    "all",
  );

  const [fuelDialogOpen, setFuelDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedFuelLog, setSelectedFuelLog] = useState<FuelLog | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    dispatch(fetchFuelLogs());
    dispatch(fetchExpenses());
    dispatch(fetchVehicles());
  }, [dispatch]);

  // Fuel Log Handlers
  const handleAddFuelLog = async (
    fuelLogData: Omit<FuelLog, "id" | "createdAt">,
  ) => {
    try {
      await dispatch(addFuelLog(fuelLogData)).unwrap();

      // Update vehicle odometer if the fuel log odometer is greater
      const vehicle = vehicles.find((v) => v.id === fuelLogData.vehicleId);
      if (vehicle && fuelLogData.odometer > vehicle.currentOdometer) {
        await dispatch(
          updateVehicle({
            id: fuelLogData.vehicleId,
            updates: { currentOdometer: fuelLogData.odometer },
          }),
        );
      }

      setFuelDialogOpen(false);
      setSnackbar({
        open: true,
        message: "Fuel log added successfully!",
        severity: "success",
      });
      dispatch(fetchVehicles());
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to add fuel log",
        severity: "error",
      });
    }
  };

  const handleUpdateFuelLog = async (
    fuelLogData: Omit<FuelLog, "id" | "createdAt">,
  ) => {
    if (!selectedFuelLog) return;

    try {
      await dispatch(
        updateFuelLog({
          id: selectedFuelLog.id,
          updates: fuelLogData,
        }),
      ).unwrap();

      // Update vehicle odometer if needed
      const vehicle = vehicles.find((v) => v.id === fuelLogData.vehicleId);
      if (vehicle && fuelLogData.odometer > vehicle.currentOdometer) {
        await dispatch(
          updateVehicle({
            id: fuelLogData.vehicleId,
            updates: { currentOdometer: fuelLogData.odometer },
          }),
        );
      }

      setFuelDialogOpen(false);
      setSelectedFuelLog(null);
      setSnackbar({
        open: true,
        message: "Fuel log updated successfully!",
        severity: "success",
      });
      dispatch(fetchVehicles());
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to update fuel log",
        severity: "error",
      });
    }
  };

  const handleDeleteFuelLog = async () => {
    if (!selectedFuelLog) return;

    try {
      await dispatch(deleteFuelLog(selectedFuelLog.id)).unwrap();
      setDeleteDialogOpen(false);
      setSelectedFuelLog(null);
      setSnackbar({
        open: true,
        message: "Fuel log deleted successfully!",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to delete fuel log",
        severity: "error",
      });
    }
  };

  // Expense Handlers
  const handleAddExpense = async (
    expenseData: Omit<Expense, "id" | "createdAt">,
  ) => {
    try {
      await dispatch(addExpense(expenseData)).unwrap();
      setExpenseDialogOpen(false);
      setSnackbar({
        open: true,
        message: "Expense added successfully!",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to add expense",
        severity: "error",
      });
    }
  };

  const handleUpdateExpense = async (
    expenseData: Omit<Expense, "id" | "createdAt">,
  ) => {
    if (!selectedExpense) return;

    try {
      await dispatch(
        updateExpense({
          id: selectedExpense.id,
          updates: expenseData,
        }),
      ).unwrap();

      setExpenseDialogOpen(false);
      setSelectedExpense(null);
      setSnackbar({
        open: true,
        message: "Expense updated successfully!",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to update expense",
        severity: "error",
      });
    }
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;

    try {
      await dispatch(deleteExpense(selectedExpense.id)).unwrap();
      setDeleteDialogOpen(false);
      setSelectedExpense(null);
      setSnackbar({
        open: true,
        message: "Expense deleted successfully!",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to delete expense",
        severity: "error",
      });
    }
  };

  // Helper Functions
  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle
      ? `${vehicle.name} (${vehicle.licensePlate})`
      : "Unknown Vehicle";
  };

  const getCategoryIcon = (category: ExpenseCategory) => {
    const icons: Record<ExpenseCategory, string> = {
      fuel: "⛽",
      maintenance: "🔧",
      insurance: "🛡️",
      toll: "🛣️",
      parking: "🅿️",
      other: "📝",
    };
    return icons[category];
  };

  const getCategoryColor = (
    category: ExpenseCategory,
  ): "primary" | "secondary" | "success" | "warning" | "info" | "default" => {
    const colors: Record<
      ExpenseCategory,
      "primary" | "secondary" | "success" | "warning" | "info" | "default"
    > = {
      fuel: "primary",
      maintenance: "warning",
      insurance: "info",
      toll: "secondary",
      parking: "success",
      other: "default",
    };
    return colors[category];
  };

  // Filter Fuel Logs
  const filteredFuelLogs = fuelLogs.filter((log) => {
    const vehicleName = getVehicleName(log.vehicleId);
    return (
      searchQuery === "" ||
      vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.odometer.toString().includes(searchQuery)
    );
  });

  // Filter Expenses
  const filteredExpenses = expenses.filter((expense) => {
    const vehicleName = getVehicleName(expense.vehicleId);
    const matchesSearch =
      searchQuery === "" ||
      vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || expense.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleFuelFormSubmit = (
    fuelLogData: Omit<FuelLog, "id" | "createdAt">,
  ) => {
    if (selectedFuelLog) {
      handleUpdateFuelLog(fuelLogData);
    } else {
      handleAddFuelLog(fuelLogData);
    }
  };

  const handleExpenseFormSubmit = (
    expenseData: Omit<Expense, "id" | "createdAt">,
  ) => {
    if (selectedExpense) {
      handleUpdateExpense(expenseData);
    } else {
      handleAddExpense(expenseData);
    }
  };

  const handleDelete = () => {
    if (activeTab === 0) {
      handleDeleteFuelLog();
    } else {
      handleDeleteExpense();
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <ExpenseIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Fuel & Expenses
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Track fuel consumption and manage vehicle expenses
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              fontWeight: 600,
              textTransform: "none",
              fontSize: "1rem",
            },
          }}
        >
          <Tab icon={<FuelIcon />} iconPosition="start" label="Fuel Logs" />
          <Tab icon={<ExpenseIcon />} iconPosition="start" label="Expenses" />
        </Tabs>
      </Paper>

      {/* Search and Filters */}
      <Paper
        sx={{
          p: 2.5,
          mb: 3,
          background: "linear-gradient(to right, #fafafa, #ffffff)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            placeholder={
              activeTab === 0 ? "Search fuel logs..." : "Search expenses..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {activeTab === 1 && (
            <TextField
              select
              label="Category"
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as ExpenseCategory | "all")
              }
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="fuel">⛽ Fuel</MenuItem>
              <MenuItem value="maintenance">🔧 Maintenance</MenuItem>
              <MenuItem value="insurance">🛡️ Insurance</MenuItem>
              <MenuItem value="toll">🛣️ Toll</MenuItem>
              <MenuItem value="parking">🅿️ Parking</MenuItem>
              <MenuItem value="other">📝 Other</MenuItem>
            </TextField>
          )}

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              if (activeTab === 0) {
                setSelectedFuelLog(null);
                setFuelDialogOpen(true);
              } else {
                setSelectedExpense(null);
                setExpenseDialogOpen(true);
              }
            }}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 14px rgba(102, 126, 234, 0.4)",
              "&:hover": {
                boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
              },
            }}
          >
            {activeTab === 0 ? "Add Fuel Log" : "Add Expense"}
          </Button>
        </Box>
      </Paper>

      {/* Fuel Logs Table */}
      {activeTab === 0 && (
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            borderRadius: 2,
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Liters</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cost/L</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total Cost</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Odometer</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFuelLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      {searchQuery
                        ? "No fuel logs found matching your search"
                        : "No fuel logs yet. Add your first fuel log!"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFuelLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {getVehicleName(log.vehicleId)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(log.date).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {log.liters.toFixed(2)} L
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        ₹{log.costPerLiter.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="primary"
                      >
                        ₹{log.totalCost.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {log.odometer.toLocaleString()} km
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          justifyContent: "flex-end",
                        }}
                      >
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedFuelLog(log);
                              setFuelDialogOpen(true);
                            }}
                            sx={{
                              color: "primary.main",
                              "&:hover": { bgcolor: "primary.lighter" },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedFuelLog(log);
                              setDeleteDialogOpen(true);
                            }}
                            sx={{
                              color: "error.main",
                              "&:hover": { bgcolor: "error.lighter" },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Expenses Table */}
      {activeTab === 1 && (
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            borderRadius: 2,
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      {searchQuery || categoryFilter !== "all"
                        ? "No expenses found matching your filters"
                        : "No expenses yet. Add your first expense!"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {getVehicleName(expense.vehicleId)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(expense.date).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${getCategoryIcon(expense.category)} ${expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}`}
                        color={getCategoryColor(expense.category)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ maxWidth: 250 }}
                      >
                        {expense.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="primary"
                      >
                        ₹{expense.amount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          justifyContent: "flex-end",
                        }}
                      >
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedExpense(expense);
                              setExpenseDialogOpen(true);
                            }}
                            sx={{
                              color: "primary.main",
                              "&:hover": { bgcolor: "primary.lighter" },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedExpense(expense);
                              setDeleteDialogOpen(true);
                            }}
                            sx={{
                              color: "error.main",
                              "&:hover": { bgcolor: "error.lighter" },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialogs */}
      <FuelLogFormDialog
        open={fuelDialogOpen}
        onClose={() => {
          setFuelDialogOpen(false);
          setSelectedFuelLog(null);
        }}
        onSubmit={handleFuelFormSubmit}
        fuelLog={selectedFuelLog}
      />

      <ExpenseFormDialog
        open={expenseDialogOpen}
        onClose={() => {
          setExpenseDialogOpen(false);
          setSelectedExpense(null);
        }}
        onSubmit={handleExpenseFormSubmit}
        expense={selectedExpense}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedFuelLog(null);
          setSelectedExpense(null);
        }}
        onConfirm={handleDelete}
        title={activeTab === 0 ? "Delete Fuel Log" : "Delete Expense"}
        message={
          activeTab === 0
            ? selectedFuelLog
              ? `Are you sure you want to delete this fuel log for "${getVehicleName(selectedFuelLog.vehicleId)}"?`
              : ""
            : selectedExpense
              ? `Are you sure you want to delete this expense for "${getVehicleName(selectedExpense.vehicleId)}"?`
              : ""
        }
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
