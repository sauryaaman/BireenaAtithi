const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');


// Helper functions for formatting
handlebars.registerHelper('formatDate', function(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
});

// Helper for formatting time in HH:mm format
handlebars.registerHelper('formatTime', function(time) {
    if (!time) return '';
    
    try {
        // If it's a full datetime string, extract just the time part
        if (time.includes('T')) {
            time = time.split('T')[1];
        }
        
        // Remove any date part if present (e.g., "2023-09-16 14:30:00")
        if (time.includes(' ')) {
            time = time.split(' ')[1];
        }
        
        // Extract hours and minutes using regex
        const timeMatch = time.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
            const [, hours, minutes] = timeMatch;
            // Format as HH:mm
            return `${hours.padStart(2, '0')}:${minutes}`;
        }
        
        return '00:00'; // fallback for invalid formats
    } catch (e) {
        return '00:00'; // fallback for any errors
    }
});

// Helper for getting array length
handlebars.registerHelper('length', function(arr) {
    return arr ? arr.length : 0;
});

// Helper for addition (used for Pax calculation)
handlebars.registerHelper('add', function(value1, value2) {
    return value1 + value2;
});

// Helper for calculating total Pax
handlebars.registerHelper('calculatePax', function(guests) {
    if (!guests) return 1;  // If no guests object, return 1 for primary guest
    const additionalCount = guests.additional ? guests.additional.length : 0;
    return 1 + additionalCount;  // 1 for primary guest + additional guests
});

handlebars.registerHelper('formatCurrency', function(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount || 0);
});

// Function to calculate GST
function calculateGST(amount) {
    const baseAmount = amount / 1.05; // Remove 5% GST
    const gstAmount = amount - baseAmount;
    return {
        baseAmount: baseAmount.toFixed(2),
        gstAmount: gstAmount.toFixed(2),
        totalAmount: amount.toFixed(2)
    };
}

async function generateInvoicePDF(invoiceData) {
    let browser = null;
    try {
        // console.log('Starting PDF generation...');
        // Define template path
        const templatePath = path.join(__dirname, 'templates', 'invoice.html');
        // console.log('Template path:', templatePath);

        // Check if template exists
        if (!fs.existsSync(templatePath)) {
            // console.error('Template file not found at:', templatePath);
            throw new Error('Invoice template file not found');
        }

        const templateHtml = fs.readFileSync(templatePath, 'utf-8');
        // console.log('Template HTML length:', templateHtml.length);

        // Calculate GST for each room and total
        let totalAmount = 0;
        invoiceData.booking.rooms = invoiceData.booking.rooms.map(room => {
            const amount = room.price_per_night * invoiceData.booking.total_nights;
            totalAmount += amount;
            return {
                ...room,
                amount: amount
            };
        });

        // Calculate final amounts with GST
        const { baseAmount, gstAmount } = calculateGST(totalAmount);
        // console.log('Calculated amounts:', { baseAmount, gstAmount, totalAmount });

        // Compile template with data
        const template = handlebars.compile(templateHtml);
        const finalHtml = template({
            ...invoiceData,
            calculatedAmounts: {
                baseAmount,
                gstAmount,
                totalAmount
            }
        });

        // console.log('Final HTML length:', finalHtml.length);

        // Launch Puppeteer with necessary configurations
        // console.log('Launching Puppeteer...');
        const isRender = process.env.NODE_ENV === 'production';
        browser = await puppeteer.launch({
            headless: 'new',
             executablePath: isRender 
        ? process.env.CHROMIUM_PATH || '/usr/bin/chromium'  // Render
        :  undefined, //
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--font-render-hinting=none'
            ]
        });

         console.log('Puppeteer launched successfully');

        const page = await browser.newPage();

        // Set viewport for consistent rendering
        await page.setViewport({
            width: 1200,
            height: 1600,
            deviceScaleFactor: 2
        });

        // Set content and wait for network idle
        // console.log('Setting page content...');
        await page.setContent(finalHtml, {
            waitUntil: 'networkidle0'
        });

        // console.log('Page content set, generating PDF...');

        // Generate PDF with proper settings
        const pdf = await page.pdf({
            format: 'A4',
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            },
            printBackground: true,
            preferCSSPageSize: true,
            timeout: 60000, // 60 second timeout
            displayHeaderFooter: false
        });

        // console.log('PDF generated successfully, size:', pdf.length);

        return pdf;
    } catch (error) {
        // console.error('Error generating PDF:', error);
        // console.error('Error stack:', error.stack);
        throw new Error('PDF generation failed: ' + error.message);
    } finally {
        // Close browser if it was initialized
        if (browser !== null) {
            try {
                await browser.close();
                // console.log('Browser closed successfully');
            } catch (closeError) {
                // console.error('Error closing browser:', closeError);
            }
        }
    }
}

module.exports = { generateInvoicePDF };