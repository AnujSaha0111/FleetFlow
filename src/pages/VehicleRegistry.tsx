import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Search,
  Edit,
  Delete,
  LocalShipping,
  Build,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchVehicles, deleteVehicle } from "../store/slices/vehiclesSlice";
import VehicleFormDialog from "../components/vehicles/VehicleFormDialog";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";
import { Vehicle, VehicleStatus } from "../types";

const VehicleRegistry: React.FC = () => {
  const dispatch = useAppDispatch();
  const { vehicles, loading, error } = useAppSelector(
    (state) => state.vehicles,
  );

  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "all">(
    "all",
  );

  useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  const handleAddClick = () => {
    setSelectedVehicle(null);
    setOpenForm(true);
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setOpenForm(true);
  };

  const handleDeleteClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setOpenDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedVehicle) {
      await dispatch(deleteVehicle(selectedVehicle.id));
      setOpenDelete(false);
      setSelectedVehicle(null);
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedVehicle(null);
  };

  const getStatusIcon = (status: VehicleStatus) => {
    switch (status) {
      case "available":
        return <CheckCircle fontSize="small" />;
      case "on-trip":
        return <LocalShipping fontSize="small" />;
      case "in-shop":
        return <Build fontSize="small" />;
      default:
        return <Cancel fontSize="small" />;
    }
  };

  const getStatusColor = (
    status: VehicleStatus,
  ): "success" | "info" | "warning" | "default" => {
    switch (status) {
      case "available":
        return "success";
      case "on-trip":
        return "info";
      case "in-shop":
        return "warning";
      default:
        return "default";
    }
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || vehicle.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          pb: 2,
          borderBottom: "2px solid",
          borderImage: "linear-gradient(90deg, #667eea 0%, #764ba2 100%) 1",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 0.5,
          }}
        >
          Vehicle Registry
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your fleet of vehicles
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Controls */}
      <Card
        sx={{
          mb: 3,
          p: 3,
          background:
            "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <TextField
            placeholder="Search vehicles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ minWidth: 300, flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) =>
                setStatusFilter(e.target.value as VehicleStatus | "all")
              }
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="on-trip">On Trip</MenuItem>
              <MenuItem value="in-shop">In Shop</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddClick}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              "&:hover": {
                boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
              },
            }}
          >
            Add Vehicle
          </Button>
        </Box>
      </Card>

      {/* Vehicle Table */}
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Model</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>License Plate</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Max Capacity (kg)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Odometer (km)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    Loading vehicles...
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {!loading && filteredVehicles.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <LocalShipping
                    sx={{ fontSize: 64, color: "grey.300", mb: 2 }}
                  />
                  <Typography color="text.secondary">
                    {searchQuery || statusFilter !== "all"
                      ? "No vehicles match your filters"
                      : 'No vehicles added yet. Click "Add Vehicle" to get started.'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              filteredVehicles.map((vehicle) => (
                <TableRow
                  key={vehicle.id}
                  sx={{
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>{vehicle.name}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>
                    <Chip
                      label={vehicle.licensePlate}
                      size="small"
                      sx={{
                        fontFamily: "monospace",
                        fontWeight: 600,
                        bgcolor: "grey.100",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {vehicle.maxLoadCapacity.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {vehicle.currentOdometer.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(vehicle.status)}
                      label={vehicle.status.replace("-", " ")}
                      color={getStatusColor(vehicle.status)}
                      size="small"
                      sx={{ textTransform: "capitalize", fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(vehicle)}
                        sx={{
                          color: "primary.main",
                          "&:hover": {
                            bgcolor: "primary.50",
                          },
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(vehicle)}
                        sx={{
                          color: "error.main",
                          ml: 1,
                          "&:hover": {
                            bgcolor: "error.50",
                          },
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogs */}
      <VehicleFormDialog
        open={openForm}
        vehicle={selectedVehicle}
        onClose={handleFormClose}
      />

      <DeleteConfirmDialog
        open={openDelete}
        title="Delete Vehicle"
        message={`Are you sure you want to delete "${selectedVehicle?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setOpenDelete(false);
          setSelectedVehicle(null);
        }}
      />
    </Box>
  );
};

export default VehicleRegistry;
