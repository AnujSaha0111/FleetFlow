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
  Person,
  CheckCircle,
  LocalShipping,
  Cancel,
  Warning,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchDrivers, deleteDriver } from "../store/slices/driversSlice";
import DriverFormDialog from "../components/drivers/DriverFormDialog";
import DeleteConfirmDialog from "../components/common/DeleteConfirmDialog";
import { Driver, DriverDutyStatus } from "../types";

const DriverProfiles: React.FC = () => {
  const dispatch = useAppDispatch();
  const { drivers, loading, error } = useAppSelector((state) => state.drivers);

  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DriverDutyStatus | "all">(
    "all",
  );

  useEffect(() => {
    dispatch(fetchDrivers());
  }, [dispatch]);

  const handleAddClick = () => {
    setSelectedDriver(null);
    setOpenForm(true);
  };

  const handleEditClick = (driver: Driver) => {
    setSelectedDriver(driver);
    setOpenForm(true);
  };

  const handleDeleteClick = (driver: Driver) => {
    setSelectedDriver(driver);
    setOpenDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedDriver) {
      await dispatch(deleteDriver(selectedDriver.id));
      setOpenDelete(false);
      setSelectedDriver(null);
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedDriver(null);
  };

  const getStatusIcon = (status: DriverDutyStatus) => {
    switch (status) {
      case "available":
        return <CheckCircle fontSize="small" />;
      case "on-trip":
        return <LocalShipping fontSize="small" />;
      case "off-duty":
        return <Cancel fontSize="small" />;
      default:
        return <Cancel fontSize="small" />;
    }
  };

  const getStatusColor = (
    status: DriverDutyStatus,
  ): "success" | "info" | "default" => {
    switch (status) {
      case "available":
        return "success";
      case "on-trip":
        return "info";
      case "off-duty":
        return "default";
      default:
        return "default";
    }
  };

  const isLicenseExpired = (expiryDate: string): boolean => {
    return new Date(expiryDate) < new Date();
  };

  const isLicenseExpiringSoon = (expiryDate: string): boolean => {
    const daysUntilExpiry = Math.floor(
      (new Date(expiryDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const getSafetyScoreColor = (score: number): string => {
    if (score >= 80) return "success.main";
    if (score >= 60) return "warning.main";
    return "error.main";
  };

  // Filter drivers
  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (driver.phone &&
        driver.phone.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || driver.dutyStatus === statusFilter;

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
          Driver Profiles
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your driver workforce
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
            placeholder="Search drivers..."
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
                setStatusFilter(e.target.value as DriverDutyStatus | "all")
              }
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="on-trip">On Trip</MenuItem>
              <MenuItem value="off-duty">Off Duty</MenuItem>
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
            Add Driver
          </Button>
        </Box>
      </Card>

      {/* Driver Table */}
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
              <TableCell sx={{ fontWeight: 700 }}>License Number</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>License Expiry</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Safety Score</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
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
                    Loading drivers...
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {!loading && filteredDrivers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Person sx={{ fontSize: 64, color: "grey.300", mb: 2 }} />
                  <Typography color="text.secondary">
                    {searchQuery || statusFilter !== "all"
                      ? "No drivers match your filters"
                      : 'No drivers added yet. Click "Add Driver" to get started.'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              filteredDrivers.map((driver) => (
                <TableRow
                  key={driver.id}
                  sx={{
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>{driver.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={driver.licenseNumber}
                      size="small"
                      sx={{
                        fontFamily: "monospace",
                        fontWeight: 600,
                        bgcolor: "grey.100",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {isLicenseExpired(driver.licenseExpiry) ? (
                        <Chip
                          icon={<Warning fontSize="small" />}
                          label={new Date(
                            driver.licenseExpiry,
                          ).toLocaleDateString()}
                          size="small"
                          color="error"
                          sx={{ fontWeight: 600 }}
                        />
                      ) : isLicenseExpiringSoon(driver.licenseExpiry) ? (
                        <Chip
                          icon={<Warning fontSize="small" />}
                          label={new Date(
                            driver.licenseExpiry,
                          ).toLocaleDateString()}
                          size="small"
                          color="warning"
                          sx={{ fontWeight: 600 }}
                        />
                      ) : (
                        <Typography variant="body2">
                          {new Date(driver.licenseExpiry).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${driver.safetyScore}/100`}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: getSafetyScoreColor(driver.safetyScore),
                        color: "white",
                      }}
                    />
                  </TableCell>
                  <TableCell>{driver.phone || "—"}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(driver.dutyStatus)}
                      label={driver.dutyStatus.replace("-", " ")}
                      color={getStatusColor(driver.dutyStatus)}
                      size="small"
                      sx={{ textTransform: "capitalize", fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(driver)}
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
                        onClick={() => handleDeleteClick(driver)}
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
      <DriverFormDialog
        open={openForm}
        driver={selectedDriver}
        onClose={handleFormClose}
      />

      <DeleteConfirmDialog
        open={openDelete}
        title="Delete Driver"
        message={`Are you sure you want to delete "${selectedDriver?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setOpenDelete(false);
          setSelectedDriver(null);
        }}
      />
    </Box>
  );
};

export default DriverProfiles;
