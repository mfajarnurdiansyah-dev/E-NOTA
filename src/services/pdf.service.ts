import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportElementToPdf(
  element: HTMLElement,
  filename: string,
  paperSize: 'A4' | 'DOT_MATRIX_210X80',
  orientation: 'portrait' | 'landscape'
): Promise<void> {
  // Capture HTML element with high quality
  const canvas = await html2canvas(element, {
    scale: 2, // 2x scale for sharp text
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');

  if (paperSize === 'DOT_MATRIX_210X80') {
    const pages = element.querySelectorAll<HTMLElement>('.dotmatrix-page');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [80, 210], // height 80mm, width 210mm
    });

    if (pages.length > 1) {
      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i];
        const pageCanvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });
        const pageImg = pageCanvas.toDataURL('image/png');
        if (i > 0) {
          pdf.addPage([80, 210], 'landscape');
        }
        pdf.addImage(pageImg, 'PNG', 0, 0, 210, 80);
      }
    } else {
      const target = pages.length === 1 ? pages[0] : element;
      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 80);
    }
    pdf.save(filename);
    return;
  } else {
    // Standard A4 portrait / landscape
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4',
    });
    const pdfPageWidth = orientation === 'portrait' ? 210 : 297;
    const pdfPageHeight = orientation === 'portrait' ? 297 : 210;
    const imgHeight = (canvas.height * pdfPageWidth) / canvas.width;

    if (imgHeight <= pdfPageHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, pdfPageWidth, imgHeight);
    } else {
      // Multi-page slicing
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfPageWidth, imgHeight);
      heightLeft -= pdfPageHeight;

      while (heightLeft > 0) {
        position -= pdfPageHeight;
        pdf.addPage('a4', orientation);
        pdf.addImage(imgData, 'PNG', 0, position, pdfPageWidth, imgHeight);
        heightLeft -= pdfPageHeight;
      }
    }

    pdf.save(filename);
  }
}
