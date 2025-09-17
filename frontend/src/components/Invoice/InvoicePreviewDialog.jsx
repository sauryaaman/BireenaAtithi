import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    Typography,
    CircularProgress
} from '@mui/material';
import { RiCloseLine, RiDownloadLine, RiPrinterLine } from 'react-icons/ri';
const BASE_URL = import.meta.env.VITE_API_URL;

const InvoicePreviewDialog = ({ open, onClose, bookingId }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleDownload = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${BASE_URL}/api/bookings/${bookingId}/invoice/download`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to download invoice');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${bookingId}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            setError('Failed to download invoice');
        }
    };

    const handlePrint = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${BASE_URL}/api/bookings/${bookingId}/invoice/download`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to load invoice');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const printWindow = window.open(url);
            printWindow.onload = () => {
                printWindow.print();
                window.URL.revokeObjectURL(url);
            };
        } catch (error) {
            console.error('Print failed:', error);
            setError('Failed to print invoice');
        }
    };

    const handleIframeLoad = () => {
        setLoading(false);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    height: '90vh',
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Invoice Preview</Typography>
                    <Box>
                        <IconButton 
                            onClick={handleDownload} 
                            color="primary" 
                            sx={{ mr: 1 }}
                            title="Download Invoice"
                        >
                            <RiDownloadLine />
                        </IconButton>
                        <IconButton 
                            onClick={handlePrint} 
                            color="primary" 
                            sx={{ mr: 1 }}
                            title="Print Invoice"
                        >
                            <RiPrinterLine />
                        </IconButton>
                        <IconButton onClick={onClose} title="Close">
                            <RiCloseLine />
                        </IconButton>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent>
                {loading && (
                    <Box 
                        display="flex" 
                        justifyContent="center" 
                        alignItems="center" 
                        height="100%"
                    >
                        <CircularProgress />
                    </Box>
                )}
                {error ? (
                    <Box 
                        display="flex" 
                        justifyContent="center" 
                        alignItems="center" 
                        height="100%"
                    >
                        <Typography color="error">{error}</Typography>
                    </Box>
                ) : (
                    <iframe
                        src={`${BASE_URL}/api/bookings/${bookingId}/invoice/download`}
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            display: loading ? 'none' : 'block'
                        }}
                        title="Invoice Preview"
                        onLoad={handleIframeLoad}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default InvoicePreviewDialog;