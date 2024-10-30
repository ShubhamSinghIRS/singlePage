import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Typography,
  Snackbar,
  Alert,
  Checkbox,
  Chip,
  Tooltip,
  Divider,
  Collapse,
} from '@mui/material';
import { Add as AddIcon, KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowRight as KeyboardArrowRightIcon } from '@mui/icons-material';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import output from '../output.json';

const theme = createTheme({
  palette: {
    primary: { main: '#ffbe34' },
    secondary: { main: '#ffffff' },
    background: { default: '#f5f5f5', paper: '#ffffff' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: 'none',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          height: '150px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 15px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 14px',
          backgroundColor: '#fff',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          wordWrap: 'break-word',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: 'background.paper',
        },
      },
    },
  },
});

const EnhancedModuleSelector = () => {
  const industries = Object.keys(output);
  const [selectedIndustry, setSelectedIndustry] = useState(industries[0]);
  const [selectedModules, setSelectedModules] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('');
  const [availableModules, setAvailableModules] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [openCategory, setOpenCategory] = useState(null); // Changed from collapsedCategories

  // Handle industry change
  const handleIndustryChange = (event) => {
    setSelectedIndustry(event.target.value);
    setSelectedModules({});
    setOpenCategory(null); // Collapse all sections on industry change
  };

  // Open dialog with available modules for the selected category
  const handleAddModule = (category) => {
    setCurrentCategory(category);
    const modules = output[selectedIndustry][category].map((module) => ({
      name: module[0],
      credits: parseInt(module[1], 10),
      mode: module[2],
      cost: parseInt(module[3], 10),
    }));
    setAvailableModules(modules);
    setOpenDialog(true);
    setOpenCategory(category); // Open the selected category
  };

  // Save or unselect module
  const handleToggleModule = (module) => {
    const categoryModules = selectedModules[currentCategory] || [];
    const isSelected = categoryModules.some((m) => m.name === module.name);
    if (isSelected) {
      // Unselect the module
      const updatedCategoryModules = categoryModules.filter(
        (m) => m.name !== module.name
      );
      setSelectedModules({
        ...selectedModules,
        [currentCategory]: updatedCategoryModules,
      });
      setSnackbar({
        open: true,
        message: `${module.name} removed.`,
        severity: 'info',
      });
    } else {
      setSelectedModules({
        ...selectedModules,
        [currentCategory]: [...categoryModules, module],
      });
      setSnackbar({
        open: true,
        message: `${module.name} added successfully!`,
        severity: 'success',
      });
    }
  };

  // Remove selected module
  const handleRemoveModule = (category, moduleName) => {
    const updatedCategoryModules = selectedModules[category].filter(
      (module) => module.name !== moduleName
    );
    setSelectedModules({
      ...selectedModules,
      [category]: updatedCategoryModules,
    });
    setSnackbar({
      open: true,
      message: `${moduleName} removed.`,
      severity: 'info',
    });
  };

  // Select All modules in dialog
  const handleSelectAll = () => {
    const allSelected = availableModules.map((module) => module);
    setSelectedModules({
      ...selectedModules,
      [currentCategory]: allSelected,
    });
    setSnackbar({
      open: true,
      message: 'All modules selected.',
      severity: 'success',
    });
  };

  // Unselect All modules in dialog
  const handleUnselectAll = () => {
    setSelectedModules({
      ...selectedModules,
      [currentCategory]: [],
    });
    setSnackbar({
      open: true,
      message: 'All modules unselected.',
      severity: 'info',
    });
  };

  // Clear all selected modules in a category
  const handleClearAllCategory = (category) => {
    setSelectedModules({
      ...selectedModules,
      [category]: [],
    });
    setSnackbar({
      open: true,
      message: `All modules cleared in ${category}.`,
      severity: 'info',
    });
  };

  // Toggle collapse for a category
  const handleToggleCollapse = (category) => {
    if (openCategory === category) {
      setOpenCategory(null);
    } else {
      setOpenCategory(category);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Calculate total credits and cost
  const totalCredits = useMemo(() => {
    return Object.values(selectedModules)
      .flat()
      .reduce((acc, module) => acc + module.credits, 0);
  }, [selectedModules]);

  const totalCost = useMemo(() => {
    return Object.values(selectedModules)
      .flat()
      .reduce((acc, module) => acc + module.cost, 0);
  }, [selectedModules]);

  // Prepare data for radar chart
  const radarData = useMemo(() => {
    return Object.keys(output[selectedIndustry])
      .filter((category) => category !== 'Site-Visits')
      .map((category) => {
        const credits =
          selectedModules[category]?.reduce((acc, module) => acc + module.credits, 0) ||
          0;
        return { category, credits };
      });
  }, [output, selectedIndustry, selectedModules]);

  return (
    <ThemeProvider theme={theme}>
      <Container
        maxWidth="lg"
        sx={{
          mt: 0,
          backgroundColor: 'background.default',
          height: "75vh",
          padding: 2,
          pt: 5,
          borderRadius: 4,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >

        <Grid container spacing={4}>
          {/* Selected Modules with Scrollbar */}
          <Grid
            item
            xs={12}
            md={8}
            sx={{
              maxHeight: '72vh',
              overflowY: 'auto',
              pr: 2,
            }}
          >

            {/* Industry Selection */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Select
                value={selectedIndustry}
                onChange={handleIndustryChange}
                fullWidth
                displayEmpty
                label={"Choose Your Industry"}
                inputProps={{ 'aria-label': 'Select Industry' }}
                sx={{
                  backgroundColor: 'white',
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  height: '40px',
                  mr: 5,
                  width: '100%'
                }}
              >
                {industries.map((industry) => (
                  <MenuItem key={industry} value={industry}>
                    {industry}
                  </MenuItem>
                ))}
              </Select>

              <Typography
                onClick={() => { setSelectedModules({}) }}
                sx={{
                  cursor: "pointer",
                  fontWeight: 'bold',
                  color: 'primary.main',
                  textDecoration: 'underline',
                }}
              >
                Reset
              </Typography>
            </Box>

            {/* Categories and Add Buttons */}
            {Object.keys(output[selectedIndustry]).map((category) => {
              const categoryModules = selectedModules[category] || [];
              const isOpen = openCategory === category;

              return (
                <Box key={category} sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleToggleCollapse(category)}
                      aria-expanded={isOpen}
                      aria-controls={`${category}-content`}
                    >
                      <IconButton
                        size="small"
                        sx={{ mr: 1 }}
                        aria-label={isOpen ? 'Collapse' : 'Expand'}
                      >
                        {isOpen ? (
                          <KeyboardArrowDownIcon />
                        ) : (
                          <KeyboardArrowRightIcon />
                        )}
                      </IconButton>
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'primary.main',
                          fontWeight: 'bold',
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {category}
                        <Chip
                          label={`${categoryModules.length} ${categoryModules.length === 1 ? 'module' : 'modules'
                            }`}
                          size="small"
                          sx={{
                            ml: 2,
                            backgroundColor: 'primary.light',
                            color: 'primary.contrastText',
                            fontWeight: 'medium',
                            '& .MuiChip-label': {
                              px: 1,
                            },
                          }}
                        />
                      </Typography>
                    </Box>
                    <Box>
                      {categoryModules.length > 0 && (
                        <Tooltip title={`Clear all modules in ${category}`}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'primary.main',
                              textDecoration: 'underline',
                              cursor: 'pointer',
                              mr: 2,
                            }}
                            onClick={() => handleClearAllCategory(category)}
                          >
                            Remove All
                          </Typography>
                        </Tooltip>
                      )}
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => handleAddModule(category)}
                        variant="contained"
                        color="primary"
                        size="small"
                        aria-label={`Add module to ${category}`}
                      >
                        Add Module
                      </Button>
                    </Box>
                  </Box>

                  <Collapse
                    in={isOpen}
                    timeout="auto"
                    unmountOnExit
                    id={`${category}-content`}
                    sx={{
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {/* Selected Modules Below Category */}
                    {categoryModules.length > 0 ? (
                      <Grid container spacing={2}>
                        {categoryModules.map((module) => (
                          <Grid item xs={12} sm={6} md={4} key={module.name} my={1}>
                            <Card
                              sx={{
                                position: 'relative',
                                padding: 1,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.02)',
                                },
                              }}
                            >
                              <CardContent
                                sx={{
                                  padding: '16px !important',
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <Box>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 'bold' }}
                                  >
                                    {module.name}
                                  </Typography>
                                  <Divider sx={{ my: 1 }} />
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                      Credits:
                                    </Typography>
                                    <Typography variant="body2">
                                      {module.credits}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                      Mode:
                                    </Typography>
                                    <Typography variant="body2">
                                      {module.mode}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                  }}
                                >
                                  <Tooltip title="Remove Module">
                                    <Typography
                                      variant="caption"
                                      color="error.main"
                                      sx={{ mr: 1, cursor: 'pointer' }}
                                      onClick={() =>
                                        handleRemoveModule(category, module.name)
                                      }
                                    >
                                      Remove
                                    </Typography>
                                  </Tooltip>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography variant="body2" color="text.secondary" ml={5}>
                        Please Add Module
                      </Typography>
                    )}
                  </Collapse>
                </Box>
              );
            })}
          </Grid>

          {/* Radar Chart and Summary on the Right */}
          <Grid item xs={12} md={4}>
            {radarData.length > 0 && (
              <Box
                sx={{
                  backgroundColor: 'white',
                  padding: 2,
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2 }}
                >
                  Competency Framework
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    data={radarData}
                  >
                    <PolarGrid gridType="circle" />
                    <PolarAngleAxis
                      dataKey="category"
                      tick={{ fontSize: 10 }} // Adjust the number to make text smaller
                    />
                    <PolarRadiusAxis
                      domain={[
                        0,
                        Math.max(...radarData.map((d) => d.credits)) + 10,
                      ]}
                    />
                    <Radar
                      name="Credits"
                      dataKey="credits"
                      stroke="#ffbe34"
                      fill="#ffbe34"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                {/* Total Credits and Cost */}
                {totalCredits > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography
                      variant="h6"
                      sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2 }}
                    >
                      Summary
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Total Credits:
                      </Typography>
                      <Typography variant="subtitle1">
                        {totalCredits}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Total Cost:
                      </Typography>
                      <Typography variant="subtitle1">
                        ${totalCost}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Selected Modules Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          fullWidth
          maxWidth="sm"
          aria-labelledby="select-module-dialog"
          PaperProps={{
            sx: {
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle
            id="select-module-dialog"
            sx={{
              backgroundColor: 'background.paper',
              color: 'primary.main',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography>Select Modules</Typography>
            <Box display={'flex'}>
              <Typography
                onClick={handleSelectAll}
                sx={{ m: 2, cursor: "pointer", fontWeight: 'bold', '&:hover': { color: 'primary.main' } }}
              >
                Select All
              </Typography>
              <Typography
                onClick={handleUnselectAll}
                sx={{ m: 2, cursor: "pointer", fontWeight: 'bold', '&:hover': { color: 'primary.main' } }}
              >
                Unselect All
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {availableModules.map((module) => {
                const isSelected =
                  selectedModules[currentCategory]?.some(
                    (m) => m.name === module.name
                  ) || false;
                return (
                  <Grid item xs={12} sm={6} key={module.name}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: isSelected
                          ? '2px solid #ffbe34'
                          : '1px solid #e0e0e0',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'border 0.3s ease, transform 0.3s ease',
                        '&:hover': {
                          border: '2px solid #ffbe34',
                          transform: 'scale(1.02)',
                        },
                      }}
                      onClick={() => handleToggleModule(module)}
                      aria-pressed={isSelected}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 'bold', mb: 1 }}
                          >
                            {module.name}
                          </Typography>
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleToggleModule(module)}
                            color="primary"
                            inputProps={{
                              'aria-label': `Select ${module.name}`,
                            }}
                          />
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            Credits:
                          </Typography>
                          <Typography variant="body2">
                            {module.credits}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            Mode:
                          </Typography>
                          <Typography variant="body2">
                            {module.mode}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="primary">
              Okay
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
            elevation={6}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default EnhancedModuleSelector;