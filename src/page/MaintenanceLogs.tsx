import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
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
  CheckCircle as CompleteIcon,
  Build as MaintenanceIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchMaintenance,
  addMaintenance,
  updateMaintenance,
  completeMaintenance,
  deleteMaintenance,
} from "../store/slices/maintenanceSlice";
import { fetchVehicles, updateVehicle } from "../store/slices/vehiclesSlice";
import MaintenanceFormDialog from "../components/maintenance/MaintenanceFormDialog";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";
import type { Maintenance, MaintenanceType, MaintenanceStatus } from "../types";

export default function MaintenanceLogs() {
  const dispatch = useAppDispatch();
  const { maintenanceRecords, loading, error } = useAppSelector(
    (state) => state.maintenance,
  );
  const vehicles = useAppSelector((state) => state.vehicles.vehicles);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | "all">(
    "all",
  );
  const [typeFilter, setTypeFilter] = useState<MaintenanceType | "all">("all");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] =
    useState<Maintenance | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    dispatch(fetchMaintenance());
    dispatch(fetchVehicles());
  }, [dispatch]);

  const handleAddMaintenance = async (
    maintenanceData: Omit<Maintenance, "id" | "createdAt" | "updatedAt">,
  ) => {
    try {
      await dispatch(addMaintenance(maintenanceData)).unwrap();

      // If status is 'in-progress', set vehicle to 'in-shop'
      if (maintenanceData.status === "in-progress") {
        await dispatch(
          updateVehicle({
            id: maintenanceData.vehicleId,
            updates: { status: "in-shop" },
          }),
        );
      }

      setFormDialogOpen(false);
      setSnackbar({
        open: true,
        message: "Maintenance record added successfully!",
        severity: "success",
      });
      dispatch(fetchVehicles());
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to add maintenance record",
        severity: "error",
      });
    }
  };

  const handleUpdateMaintenance = async (
    maintenanceData: Omit<Maintenance, "id" | "createdAt" | "updatedAt">,
  ) => {
    if (!selectedMaintenance) return;

    try {
      const oldStatus = selectedMaintenance.status;
      const newStatus = maintenanceData.status;

      await dispatch(
        updateMaintenance({
          id: selectedMaintenance.id,
          updates: maintenanceData,
        }),
      ).unwrap();

      // Handle vehicle status changes
      if (oldStatus !== newStatus) {
        if (newStatus === "in-progress") {
          // Set vehicle to 'in-shop'
          await dispatch(
            updateVehicle({
              id: maintenanceData.vehicleId,
              updates: { status: "in-shop" },
            }),
          );
        } else if (newStatus === "completed" && oldStatus === "in-progress") {
          // Optionally restore vehicle to 'available' when maintenance is completed
          await dispatch(
            updateVehicle({
              id: maintenanceData.vehicleId,
              updates: { status: "available" },
            }),
          );
        }
      }

      setFormDialogOpen(false);
      setSelectedMaintenance(null);
      setSnackbar({
        open: true,
        message: "Maintenance record updated successfully!",
        severity: "success",
      });
      dispatch(fetchVehicles());
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to update maintenance record",
        severity: "error",
      });
    }
  };

  const handleCompleteMaintenance = async (maintenance: Maintenance) => {
    try {
      const completedDate = new Date().toISOString();
      await dispatch(
        completeMaintenance({
          id: maintenance.id,
          completedDate,
        }),
      ).unwrap();

      // Restore vehicle to 'available' when maintenance is completed
      if (maintenance.status === "in-progress") {
        await dispatch(
          updateVehicle({
            id: maintenance.vehicleId,
            updates: { status: "available" },
          }),
        );
      }

      setSnackbar({
        open: true,
        message: "Maintenance completed! Vehicle is now available.",
        severity: "success",
      });
      dispatch(fetchVehicles());
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to complete maintenance",
        severity: "error",
      });
    }
  };

  const handleDeleteMaintenance = async () => {
    if (!selectedMaintenance) return;

    try {
      // If maintenance is in-progress, restore vehicle to available
      if (selectedMaintenance.status === "in-progress") {
        await dispatch(
          updateVehicle({
            id: selectedMaintenance.vehicleId,
            updates: { status: "available" },
          }),
        );
      }

      await dispatch(deleteMaintenance(selectedMaintenance.id)).unwrap();
      setDeleteDialogOpen(false);
      setSelectedMaintenance(null);
      setSnackbar({
        open: true,
        message: "Maintenance record deleted successfully!",
        severity: "success",
      });
      dispatch(fetchVehicles());
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to delete maintenance record",
        severity: "error",
      });
    }
  };

  const openEditDialog = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance);
    setFormDialogOpen(true);
  };

  const openDeleteDialog = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance);
    setDeleteDialogOpen(true);
  };

  // Filter maintenance records
  const filteredRecords = maintenanceRecords.filter((record) => {
    const vehicle = vehicles.find((v) => v.id === record.vehicleId);
    const vehicleName = vehicle ? vehicle.name : "";

    const matchesSearch =
      searchQuery === "" ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicleName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter;
    const matchesType = typeFilter === "all" || record.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (
    status: MaintenanceStatus,
  ): "warning" | "info" | "success" => {
    switch (status) {
      case "pending":
        return "warning";
      case "in-progress":
        return "info";
      case "completed":
        return "success";
      default:
        return "info";
    }
  };

  const getTypeLabel = (type: MaintenanceType): string => {
    const labels: Record<MaintenanceType, string> = {
      preventive: "Preventive",
      repair: "Repair",
      inspection: "Inspection",
      other: "Other",
    };
    return labels[type];
  };

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle
      ? `${vehicle.name} (${vehicle.licensePlate})`
      : "Unknown Vehicle";
  };

  const handleFormSubmit = (
    maintenanceData: Omit<Maintenance, "id" | "createdAt" | "updatedAt">,
  ) => {
    if (selectedMaintenance) {
      handleUpdateMaintenance(maintenanceData);
    } else {
      handleAddMaintenance(maintenanceData);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <MaintenanceIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Maintenance Logs
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Track and manage vehicle maintenance records
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

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
            placeholder="Search maintenance..."
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

          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as MaintenanceStatus | "all")
            }
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>

          <TextField
            select
            label="Type"
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value as MaintenanceType | "all")
            }
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="preventive">Preventive</MenuItem>
            <MenuItem value="repair">Repair</MenuItem>
            <MenuItem value="inspection">Inspection</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedMaintenance(null);
              setFormDialogOpen(true);
            }}
            sx={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              boxShadow: "0 4px 14px rgba(245, 87, 108, 0.4)",
              "&:hover": {
                boxShadow: "0 6px 20px rgba(245, 87, 108, 0.6)",
              },
            }}
          >
            Add Record
          </Button>
        </Box>
      </Paper>

      {/* Maintenance Table */}
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
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Cost</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && maintenanceRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    Loading maintenance records...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    {searchQuery ||
                    statusFilter !== "all" ||
                    typeFilter !== "all"
                      ? "No maintenance records found matching your filters"
                      : "No maintenance records yet. Add your first record!"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow key={record.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {getVehicleName(record.vehicleId)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(record.date).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getTypeLabel(record.type)}
                      size="small"
                      variant="outlined"
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
                      {record.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      ₹{record.cost.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        record.status
                          .replace("-", " ")
                          .charAt(0)
                          .toUpperCase() +
                        record.status.replace("-", " ").slice(1)
                      }
                      color={getStatusColor(record.status)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        justifyContent: "flex-end",
                      }}
                    >
                      {record.status !== "completed" && (
                        <Tooltip title="Mark as Completed">
                          <IconButton
                            size="small"
                            onClick={() => handleCompleteMaintenance(record)}
                            sx={{
                              color: "success.main",
                              "&:hover": { bgcolor: "success.lighter" },
                            }}
                          >
                            <CompleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => openEditDialog(record)}
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
                          onClick={() => openDeleteDialog(record)}
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

      {/* Dialogs */}
      <MaintenanceFormDialog
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setSelectedMaintenance(null);
        }}
        onSubmit={handleFormSubmit}
        maintenance={selectedMaintenance}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedMaintenance(null);
        }}
        onConfirm={handleDeleteMaintenance}
        title="Delete Maintenance Record"
        message={
          selectedMaintenance
            ? `Are you sure you want to delete this maintenance record for "${getVehicleName(
                selectedMaintenance.vehicleId,
              )}"? ${
                selectedMaintenance.status === "in-progress"
                  ? "This will restore the vehicle to available status."
                  : ""
              }`
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
