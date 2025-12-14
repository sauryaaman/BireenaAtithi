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

// Helper for multiplication
handlebars.registerHelper('multiply', function(value1, value2) {
    return value1 * value2;
});

handlebars.registerHelper('formatCurrency', function(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount || 0);
});

// Function to calculate split GST amounts from total
function calculateGST(totalAmount) {
    const baseAmount = totalAmount / 1.05; // Remove 5% GST
    const totalGstAmount = totalAmount - baseAmount;
    const cgstAmount = totalGstAmount / 2; // Split GST into CGST (2.5%)
    const sgstAmount = totalGstAmount / 2; // and SGST (2.5%)
    return {
        baseAmount: baseAmount.toFixed(2),
        cgstAmount: cgstAmount.toFixed(2),
        sgstAmount: sgstAmount.toFixed(2)
    };
}

// Function to generate Food Bill PDF
async function generateFoodBillPDF(foodBillData) {
    let browser = null;
    try {
        const templatePath = path.join(__dirname, 'templates', 'foodBill.html');
        
        if (!fs.existsSync(templatePath)) {
            throw new Error('Food bill template file not found');
        }

        const templateHtml = fs.readFileSync(templatePath, 'utf-8');
        
        // Calculate GST for food
        const totalAmount = parseFloat(foodBillData.foodOrder.total_amount);
        const { baseAmount, cgstAmount, sgstAmount } = calculateGST(totalAmount);
        
        const template = handlebars.compile(templateHtml);
        const finalHtml = template({
            ...foodBillData,
            foodCalculations: {
                baseAmount,
                cgstAmount,
                sgstAmount
            },
            currentDate: new Date().toISOString()
        });

        browser = await puppeteer.launch({
            headless: 'new',
            executablePath: undefined,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--font-render-hinting=none'
            ]
        });

        const page = await browser.newPage();
        await page.setViewport({
            width: 1200,
            height: 1600,
            deviceScaleFactor: 2
        });

        await page.setContent(finalHtml, {
            waitUntil: 'networkidle0'
        });

        const pdf = await page.pdf({
            format: 'A4',
            margin: {
                top: '15px',
                right: '15px',
                bottom: '15px',
                left: '15px'
            },
            printBackground: true,
            preferCSSPageSize: true,
            timeout: 60000,
            displayHeaderFooter: false,
            scale: 0.95
        });

        return pdf;
    } catch (error) {
        throw new Error('Food bill PDF generation failed: ' + error.message);
    } finally {
        if (browser !== null) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error('Error closing browser:', closeError);
            }
        }
    }
}

async function generateInvoicePDF(invoiceData, foodBillData = null) {
    let browser = null;
    try {
        // Load room invoice template
        const roomTemplatePath = path.join(__dirname, 'templates', 'invoice.html');
        
        if (!fs.existsSync(roomTemplatePath)) {
            throw new Error('Invoice template file not found');
        }

        const roomTemplateHtml = fs.readFileSync(roomTemplatePath, 'utf-8');

        // Calculate split GST amounts from booking total amount
        const totalAmount = parseFloat(invoiceData.booking.total_amount);
        const { baseAmount, cgstAmount, sgstAmount } = calculateGST(totalAmount);
        
        // Compile room invoice template
        const roomTemplate = handlebars.compile(roomTemplateHtml);
        const roomHtml = roomTemplate({
            ...invoiceData,
            calculatedAmounts: {
                baseAmount,
                cgstAmount,
                sgstAmount
            }
        });

        // Prepare combined HTML
        let combinedHtml = roomHtml;

        // If food bill data exists, add food bill page
        if (foodBillData) {
            const foodTemplatePath = path.join(__dirname, 'templates', 'foodBill.html');
            
            if (fs.existsSync(foodTemplatePath)) {
                const foodTemplateHtml = fs.readFileSync(foodTemplatePath, 'utf-8');
                
                // Calculate GST for food
                const foodTotal = parseFloat(foodBillData.foodOrder.total_amount);
                const foodGST = calculateGST(foodTotal);
                
                const foodTemplate = handlebars.compile(foodTemplateHtml);
                const foodHtml = foodTemplate({
                    ...foodBillData,
                    foodCalculations: {
                        baseAmount: foodGST.baseAmount,
                        cgstAmount: foodGST.cgstAmount,
                        sgstAmount: foodGST.sgstAmount
                    },
                    currentDate: new Date().toISOString()
                });

                // Combine both pages - room invoice first, then food bill
                combinedHtml = roomHtml + foodHtml;
            }
        }

        // Launch Puppeteer
        browser = await puppeteer.launch({
            headless: 'new',
            executablePath: undefined, 
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--font-render-hinting=none'
            ]
        });

        // console.log('Puppeteer launched successfully');

        const page = await browser.newPage();

        await page.setViewport({
            width: 1200,
            height: 1600,
            deviceScaleFactor: 2
        });

        await page.setContent(combinedHtml, {
            waitUntil: 'networkidle0'
        });

        // Generate single PDF with multiple pages
        const pdf = await page.pdf({
            format: 'A4',
            margin: {
                top: '15px',
                right: '15px',
                bottom: '15px',
                left: '15px'
            },
            printBackground: true,
            preferCSSPageSize: true,
            timeout: 60000,
            displayHeaderFooter: false,
            scale: 0.95
        });

        // console.log('PDF generated successfully, size:', pdf.length);

        return pdf;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('PDF generation failed: ' + error.message);
    } finally {
        if (browser !== null) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error('Error closing browser:', closeError);
            }
        }
    }
}

module.exports = { generateInvoicePDF };