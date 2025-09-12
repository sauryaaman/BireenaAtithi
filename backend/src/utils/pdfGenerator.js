const PDFDocument = require('pdfkit');

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount || 0);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

function generateInvoicePDF(booking, doc) {
    // Set document metadata
    doc.info.Title = `Invoice-${booking.booking_id}`;
    doc.info.Author = 'Hotel Nalanda City';

    // Header
    doc.fontSize(24)
       .text('INVOICE', { align: 'center' })
       .moveDown();

    // Hotel Info
    doc.fontSize(16)
       .text('Hotel Nalanda City', { align: 'center' })
       .fontSize(10)
       .text('Nalanda Nalanda More, Nalanda, Bihar, 803111', { align: 'center' })
       .text('+91 7903893936', { align: 'center' })
       .text('Citynalanda712@gmail.com', { align: 'center' })
       .moveDown(2);

    // Invoice Details
    doc.fontSize(12)
       .text(`Invoice No: INV-${booking.booking_id}`, { align: 'left' })
       .text(`Date: ${formatDate(booking.checkin_date)}`, { align: 'left' })
       .text(`Booking ID: ${booking.booking_id}`, { align: 'left' })
       .moveDown();

    // Customer Details
    doc.fontSize(14)
       .text('Bill To:', { underline: true })
       .fontSize(12)
       .moveDown(0.5)
       .text(booking.customer.name)
       .text(`Phone: ${booking.customer.phone}`)
       .text(`Email: ${booking.customer.email}`)
       .moveDown(2);

    // Table Header
    const startX = 50;
    let currentY = doc.y;

    doc.fontSize(12)
       .text('Description', startX, currentY)
       .text('Rate/Night', 300, currentY)
       .text('Nights', 400, currentY)
       .text('Amount', 480, currentY)
       .moveDown();

    currentY = doc.y;
    doc.moveTo(startX, currentY)
       .lineTo(550, currentY)
       .stroke();
    doc.moveDown();

    // Room Details
    let totalAmount = 0;
    booking.booking_rooms.forEach((room, index) => {
        currentY = doc.y;
        const roomType = room.rooms.room_type.replace(/_/g, ' ');
        const pricePerNight = room.rooms.price_per_night || 0;
        const amount = pricePerNight * booking.nights;
        totalAmount += amount;

        doc.text(roomType, startX, currentY)
           .text(`Room ${room.rooms.room_number}`, startX, currentY + 20)
           .text(formatCurrency(pricePerNight), 300, currentY)
           .text(booking.nights.toString(), 400, currentY)
           .text(formatCurrency(amount), 480, currentY)
           .moveDown(2);
    });

    // Totals
    currentY = doc.y;
    doc.moveTo(startX, currentY)
       .lineTo(550, currentY)
       .stroke()
       .moveDown();

    const subtotal = totalAmount / 1.18; // Remove 18% GST
    const gst = totalAmount - subtotal;

    doc.text('Subtotal:', 350, doc.y)
       .text(formatCurrency(subtotal), 480)
       .moveDown();

    doc.text('GST (18%):', 350)
       .text(formatCurrency(gst), 480)
       .moveDown();

    doc.fontSize(14)
       .text('Total Amount:', 350)
       .text(formatCurrency(totalAmount), 480)
       .moveDown(2);

    // Payment Status
    doc.fontSize(12)
       .text(`Payment Status: ${booking.payment_status}`, { align: 'right' })
       .text(`Booking Status: ${booking.status}`, { align: 'right' })
       .moveDown();

    if (booking.checkin_time) {
        doc.text(`Check-in Time: ${new Date(booking.checkin_time).toLocaleString()}`, { align: 'right' });
    }
    if (booking.checkout_time) {
        doc.text(`Check-out Time: ${new Date(booking.checkout_time).toLocaleString()}`, { align: 'right' });
    }

    // Footer
    doc.fontSize(10)
       .moveDown(4)
       .text('Terms & Conditions:', { underline: true })
       .moveDown(0.5)
       .text('• This is a computer generated invoice and does not require a signature')
       .text('• All prices are inclusive of GST')
       .text('• Please retain this invoice for your records');

    return doc;
}

module.exports = { generateInvoicePDF };
