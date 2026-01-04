import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@connected-repo/ui-mui/feedback/Dialog";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MedicationLiquidIcon from "@mui/icons-material/MedicationLiquid"; // Or any pill icon
import { IconButton } from "@mui/material"; // Assuming standard MUI for base components not in repo

interface SupplementActionDialogProps {
    open: boolean;
    onClose: () => void;
    onTaken: () => void;
    onSkip: () => void;
    supplementName: string;
    supplementDosage: string;
    supplementInstructions: string[];
}

export const SupplementActionDialog = ({
    open,
    onClose,
    onTaken,
    onSkip,
    supplementName,
    supplementDosage,
    supplementInstructions,
}: SupplementActionDialogProps) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs" // Reduced width for a more focused mobile-app feel
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4, // Much softer corners
                    p: 1,
                    backgroundImage: 'none',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)', // Soft, modern shadow
                },
            }}
        >
            {/* Header with Close Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 1, pt: 1 }}>
                <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <DialogContent sx={{ pt: 0, pb: 3, textAlign: 'center' }}>
                <Stack spacing={3} alignItems="center">
                    
                    {/* Hero Section: Icon & Name */}
                    <Box>
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                bgcolor: 'success.light', // Light green background
                                color: 'success.dark',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                                opacity: 0.2
                            }}
                        >
                            {/* Make sure to install @mui/icons-material if missing */}
                            <MedicationLiquidIcon sx={{ fontSize: 32, opacity: 1, color: '#1b5e20' }} /> 
                        </Box>
                        
                        <Typography variant="h5" fontWeight={700} color="text.primary">
                            {supplementName}
                        </Typography>
                        
                        <Box
                            sx={{
                                display: 'inline-block',
                                mt: 1,
                                px: 2,
                                py: 0.5,
                                bgcolor: 'grey.100',
                                borderRadius: 8,
                                border: '1px solid',
                                borderColor: 'grey.200'
                            }}
                        >
                            <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                                {supplementDosage}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Instructions Card */}
                    {supplementInstructions.length > 0 && (
                        <Box
                            sx={{
                                width: '100%',
                                bgcolor: 'background.paper', // Or a specific light blue/yellow tint
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 3,
                                p: 2,
                                textAlign: 'left'
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                <InfoOutlinedIcon fontSize="small" color="info" />
                                <Typography variant="subtitle2" fontWeight={600}>
                                    How to take
                                </Typography>
                            </Stack>
                            <Stack spacing={0.5}>
                                {supplementInstructions.map((instruction, index) => (
                                    <Typography 
                                        key={index} 
                                        variant="body2" 
                                        color="text.secondary"
                                        sx={{ display: 'flex', alignItems: 'flex-start' }}
                                    >
                                        <span style={{ marginRight: '8px', opacity: 0.6 }}>•</span>
                                        {instruction}
                                    </Typography>
                                ))}
                            </Stack>
                        </Box>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Stack direction="row" spacing={2} width="100%">
                    <Button
                        onClick={onSkip}
                        fullWidth
                        variant="text"
                        color="inherit" // Neutral color implies "dismiss" without being aggressive
                        sx={{
                            py: 1.5,
                            borderRadius: 3,
                            color: 'text.secondary',
                            fontWeight: 600
                        }}
                    >
                        Skip
                    </Button>
                    <Button
                        onClick={onTaken}
                        fullWidth
                        variant="contained"
                        disableElevation
                        sx={{
                            py: 1.5,
                            borderRadius: 3,
                            fontWeight: 700,
                            textTransform: 'none',
                            fontSize: '1rem',
                            background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                            boxShadow: '0 4px 12px rgba(32, 201, 151, 0.3)', // Glow effect
                            "&:hover": {
                                background: "linear-gradient(135deg, #218838 0%, #1aa179 100%)",
                            },
                        }}
                    >
                        Mark as Taken
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};