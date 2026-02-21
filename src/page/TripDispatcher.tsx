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
  Delete as DeleteIcon,
  CheckCircle as CompleteIcon,
  LocalShipping as TruckIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchTrips,
  addTrip,
  completeTrip,
  deleteTrip,
} from "../store/slices/tripsSlice";
import { fetchVehicles, updateVehicle } from "../store/slices/vehiclesSlice";
import { fetchDrivers, updateDriver } from "../store/slices/driversSlice";
import TripFormDialog from "../components/trips/TripFormDialog";
import CompleteTripDialog from "../components/trips/CompleteTripDialog";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";
import type { Trip, TripStatus } from "../types";

export default function TripDispatcher() {
  const dispatch = useAppDispatch();
  const { trips, loading, error } = useAppSelector((state) => state.trips);
  const vehicles = useAppSelector((state) => state.vehicles.vehicles);
  const drivers = useAppSelector((state) => state.drivers.drivers);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TripStatus | "all">("all");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    dispatch(fetchTrips());
    dispatch(fetchVehicles());
    dispatch(fetchDrivers());
  }, [dispatch]);

  const handleAddTrip = async (
    tripData: Omit<Trip, "id" | "createdAt" | "updatedAt">,
  ) => {
    try {
      await dispatch(addTrip(tripData)).unwrap();

      // Update vehicle status to 'on-trip'
      await dispatch(
        updateVehicle({
          id: tripData.vehicleId,
          updates: { status: "on-trip" },
        }),
      );

      // Update driver status to 'on-trip'
      await dispatch(
        updateDriver({
          id: tripData.driverId,
          updates: { dutyStatus: "on-trip" },
        }),
      );

      setFormDialogOpen(false);
      setSnackbar({
        open: true,
        message: "Trip created successfully!",
        severity: "success",
      });
      dispatch(fetchVehicles());
      dispatch(fetchDrivers());
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to create trip",
        severity: "error",
      });
    }
  };

  const handleCompleteTrip = async (
    endOdometer: number,
    actualArrival: string,
  ) => {
    if (!selectedTrip) return;

    try {
      await dispatch(
        completeTrip({
          id: selectedTrip.id,
          endOdometer,
          actualArrival,
        }),
      ).unwrap();

      // Update vehicle: set status to 'available' and update odometer
      await dispatch(
        updateVehicle({
          id: selectedTrip.vehicleId,
          updates: {
            status: "available",
            currentOdometer: endOdometer,
          },
        }),
      );

      // Update driver: set status to 'available'
      await dispatch(
        updateDriver({
          id: selectedTrip.driverId,
          updates: { dutyStatus: "available" },
        }),
      );

      setCompleteDialogOpen(false);
      setSelectedTrip(null);
      setSnackbar({
        open: true,
        message: "Trip completed successfully!",
        severity: "success",
      });
      dispatch(fetchVehicles());
      dispatch(fetchDrivers());
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to complete trip",
        severity: "error",
      });
    }
  };

  const handleDeleteTrip = async () => {
    if (!selectedTrip) return;

    try {
      // If trip is active, restore vehicle and driver status before deleting
      if (selectedTrip.status === "active") {
        await dispatch(
          updateVehicle({
            id: selectedTrip.vehicleId,
            updates: { status: "available" },
          }),
        );

        await dispatch(
          updateDriver({
            id: selectedTrip.driverId,
            updates: { dutyStatus: "available" },
          }),
        );
      }

      await dispatch(deleteTrip(selectedTrip.id)).unwrap();
      setDeleteDialogOpen(false);
      setSelectedTrip(null);
      setSnackbar({
        open: true,
        message: "Trip deleted successfully!",
        severity: "success",
      });
      dispatch(fetchVehicles());
      dispatch(fetchDrivers());
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to delete trip",
        severity: "error",
      });
    }
  };

  const openCompleteDialog = (trip: Trip) => {
    setSelectedTrip(trip);
    setCompleteDialogOpen(true);
  };

  const openDeleteDialog = (trip: Trip) => {
    setSelectedTrip(trip);
    setDeleteDialogOpen(true);
  };

  // Filter trips
  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      searchQuery === "" ||
      trip.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.cargoDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicles
        .find((v) => v.id === trip.vehicleId)
        ?.name.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      drivers
        .find((d) => d.id === trip.driverId)
        ?.name.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || trip.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (
    status: TripStatus,
  ): "primary" | "success" | "default" => {
    switch (status) {
      case "active":
        return "primary";
      case "completed":
        return "success";
      case "cancelled":
        return "default";
      default:
        return "default";
    }
  };

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle
      ? `${vehicle.name} (${vehicle.licensePlate})`
      : "Unknown Vehicle";
  };

  const getDriverName = (driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    return driver ? driver.name : "Unknown Driver";
  };

  const getVehicleCurrentOdometer = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle?.currentOdometer || 0;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <TruckIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Trip Dispatcher
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Create and manage logistics trips with intelligent validation
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
            placeholder="Search trips..."
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
              setStatusFilter(e.target.value as TripStatus | "all")
            }
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedTrip(null);
              setFormDialogOpen(true);
            }}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 14px rgba(102, 126, 234, 0.4)",
              "&:hover": {
                boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
              },
            }}
          >
            Create Trip
          </Button>
        </Box>
      </Paper>

      {/* Trips Table */}
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
              <TableCell sx={{ fontWeight: 600 }}>Route</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Driver</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Cargo</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Departure</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && trips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    Loading trips...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredTrips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    {searchQuery || statusFilter !== "all"
                      ? "No trips found matching your filters"
                      : "No trips yet. Create your first trip!"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredTrips.map((trip) => (
                <TableRow key={trip.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {trip.origin}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ↓ {trip.destination}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getVehicleName(trip.vehicleId)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getDriverName(trip.driverId)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {trip.cargoWeight} kg
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      sx={{ maxWidth: 150, display: "block" }}
                    >
                      {trip.cargoDescription}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(trip.departureDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(trip.departureDate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        trip.status.charAt(0).toUpperCase() +
                        trip.status.slice(1)
                      }
                      color={getStatusColor(trip.status)}
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
                      {trip.status === "active" && (
                        <Tooltip title="Complete Trip">
                          <IconButton
                            size="small"
                            onClick={() => openCompleteDialog(trip)}
                            sx={{
                              color: "success.main",
                              "&:hover": { bgcolor: "success.lighter" },
                            }}
                          >
                            <CompleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => openDeleteDialog(trip)}
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
      <TripFormDialog
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setSelectedTrip(null);
        }}
        onSubmit={handleAddTrip}
        trip={selectedTrip}
      />

      <CompleteTripDialog
        open={completeDialogOpen}
        onClose={() => {
          setCompleteDialogOpen(false);
          setSelectedTrip(null);
        }}
        onComplete={handleCompleteTrip}
        trip={selectedTrip}
        vehicleCurrentOdometer={
          selectedTrip ? getVehicleCurrentOdometer(selectedTrip.vehicleId) : 0
        }
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedTrip(null);
        }}
        onConfirm={handleDeleteTrip}
        title="Delete Trip"
        message={
          selectedTrip
            ? `Are you sure you want to delete the trip from "${selectedTrip.origin}" to "${selectedTrip.destination}"? ${
                selectedTrip.status === "active"
                  ? "This will restore the vehicle and driver to available status."
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
