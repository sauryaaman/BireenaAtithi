import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const downloadInvoicePDF = async (bookingId) => {
  const element = document.getElementById('invoice-printable');
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`invoice-${bookingId}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate invoice PDF. Please try again.');
  }
};

export const printInvoice = () => {
  window.print();
};
