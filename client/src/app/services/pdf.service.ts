import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  
  async generatePdfFromElement(elementId: string): Promise<Blob> {
    const element = document.getElementById(elementId);
    
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`);
    }

    // Debug element visibility
    console.log('Element found:', element);
    console.log('Element computed style:', window.getComputedStyle(element));
    
    // Check if element or any parent is hidden
    const isElementHidden = this.isElementOrParentHidden(element);
    console.log('Is element hidden:', isElementHidden);

    // Get dimensions using different methods
    const rect = element.getBoundingClientRect();
    const offsetDims = { width: element.offsetWidth, height: element.offsetHeight };
    const scrollDims = { width: element.scrollWidth, height: element.scrollHeight };
    
    console.log('Rect dimensions:', rect);
    console.log('Offset dimensions:', offsetDims);
    console.log('Scroll dimensions:', scrollDims);

    // Use scroll dimensions if rect dimensions are 0 (element might be hidden)
    const width = rect.width || offsetDims.width || scrollDims.width;
    const height = rect.height || offsetDims.height || scrollDims.height;

    if (width === 0 || height === 0) {
      // Try to make element visible temporarily
      console.log('Element has no dimensions, attempting to make visible...');
      return await this.generatePdfFromHiddenElement(element);
    }

    // Wait for fonts and images to load
    await this.waitForElementReady(element);

    // Create a temporary visible clone for better rendering
    const clonedElement = await this.createVisibleClone(element);
    
    try {
      const canvas = await html2canvas(clonedElement, {
        useCORS: true,
        scale: 3, // Increased from 2 to 3 for much better text quality
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: clonedElement.scrollWidth,
        height: clonedElement.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
        // Better text rendering options
        ignoreElements: (element) => {
          // Skip elements that might cause issues
          return element.tagName === 'SCRIPT' || element.tagName === 'NOSCRIPT';
        },
        // Force better DPI for text
        // Better text rendering
      });

      // Validate canvas
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas creation failed - element may be empty');
      }

      // Convert to high quality JPEG with maximum quality
      const imageData = canvas.toDataURL('image/jpeg', 1.0); // Changed from 0.98 to 1.0 for maximum quality
      
      if (!imageData || imageData.length < 100) {
        throw new Error('Failed to generate image from canvas');
      }

      // Create PDF with proper error handling
      return await this.createPdfFromImage(imageData, canvas.width, canvas.height);
      
    } finally {
      // Clean up cloned element
      if (clonedElement?.parentNode) {
        clonedElement.parentNode.removeChild(clonedElement);
      }
    }
  }

  private isElementOrParentHidden(element: HTMLElement): boolean {
    let current: HTMLElement | null = element;
    
    while (current && current !== document.body) {
      const style = window.getComputedStyle(current);
      if (style.display === 'none' || 
          style.visibility === 'hidden' || 
          style.opacity === '0' ||
          current.hidden) {
        return true;
      }
      current = current.parentElement;
    }
    
    return false;
  }

  private async generatePdfFromHiddenElement(element: HTMLElement): Promise<Blob> {
    // Store original styles
    const originalStyles = new Map<HTMLElement, string>();
    const elementsToShow: HTMLElement[] = [];
    
    // Find all hidden parents and the element itself
    let current: HTMLElement | null = element;
    while (current && current !== document.body) {
      const style = window.getComputedStyle(current);
      if (style.display === 'none' || 
          style.visibility === 'hidden' || 
          style.opacity === '0' ||
          current.hidden) {
        originalStyles.set(current, current.getAttribute('style') || '');
        elementsToShow.push(current);
      }
      current = current.parentElement;
    }

    try {
      // Temporarily show elements
      elementsToShow.forEach(el => {
        el.style.cssText += '; display: block !important; visibility: visible !important; opacity: 1 !important; position: absolute !important; left: -9999px !important; top: 0 !important;';
        el.hidden = false;
      });

      // Force layout recalculation
      element.offsetHeight;
      
      // Wait a bit for rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check dimensions again
      const newRect = element.getBoundingClientRect();
      const newWidth = element.offsetWidth || element.scrollWidth;
      const newHeight = element.offsetHeight || element.scrollHeight;
      
      console.log('After making visible - Width:', newWidth, 'Height:', newHeight);
      
      if (newWidth === 0 || newHeight === 0) {
        throw new Error('Element still has no dimensions after making visible. Check if element contains any content.');
      }

      // Wait for fonts and images to load
      await this.waitForElementReady(element);

      // Create a visible clone for rendering
      const clonedElement = await this.createVisibleClone(element);
      
      try {
        const canvas = await html2canvas(clonedElement, {
          useCORS: true,
          scale: 3, // Increased scale for better quality
          allowTaint: false,
          backgroundColor: '#ffffff',
          width: newWidth,
          height: newHeight,
          scrollX: 0,
          scrollY: 0,
          logging: false,
          imageTimeout: 15000,
          removeContainer: true,
        });

        // Validate canvas
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
          throw new Error('Canvas creation failed - generated canvas has no dimensions');
        }

        // Convert to JPEG with maximum quality
        const imageData = canvas.toDataURL('image/jpeg', 1.0);
        
        if (!imageData || imageData.length < 100) {
          throw new Error('Failed to generate image from canvas');
        }

        // Create PDF
        return await this.createPdfFromImage(imageData, canvas.width, canvas.height);
        
      } finally {
        // Clean up cloned element
        if (clonedElement?.parentNode) {
          clonedElement.parentNode.removeChild(clonedElement);
        }
      }
    } finally {
      // Restore original styles
      elementsToShow.forEach(el => {
        const originalStyle = originalStyles.get(el);
        if (originalStyle) {
          el.setAttribute('style', originalStyle);
        } else {
          el.removeAttribute('style');
        }
      });
    }
  }

  private async createVisibleClone(element: HTMLElement): Promise<HTMLElement> {
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Apply styles to make clone render properly with much better text scaling
    clone.style.cssText += `
      position: absolute !important;
      left: -9999px !important;
      top: 0 !important;
      width: 210mm !important;
      min-width: 210mm !important;
      max-width: 210mm !important;
      height: auto !important;
      transform: none !important;
      zoom: 1.5 !important;
      font-size: 16px !important;
      line-height: 1.6 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      overflow: visible !important;
      padding: 20px !important;
      margin: 0 !important;
      box-sizing: border-box !important;
    `;
    
    // Force all text elements to have readable sizes
    const allElements = clone.querySelectorAll('*');
    allElements.forEach((el: any) => {
      const computedStyle = window.getComputedStyle(el);
      const currentFontSize = parseFloat(computedStyle.fontSize);
      
      // Ensure minimum font sizes for readability
      if (el.tagName === 'H1' || el.tagName === 'H2') {
        el.style.fontSize = '24px !important';
        el.style.fontWeight = 'bold !important';
      } else if (el.tagName === 'H3' || el.tagName === 'H4') {
        el.style.fontSize = '20px !important';
        el.style.fontWeight = 'bold !important';
      } else if (el.tagName === 'H5' || el.tagName === 'H6') {
        el.style.fontSize = '18px !important';
        el.style.fontWeight = 'bold !important';
      } else if (el.tagName === 'P' || el.tagName === 'LI' || el.tagName === 'TD' || el.tagName === 'TH') {
        if (currentFontSize < 14) {
          el.style.fontSize = '14px !important';
        }
        el.style.lineHeight = '1.6 !important';
      }
      
      // Force table elements to have proper sizing
      if (el.tagName === 'TABLE') {
        el.style.width = '100% !important';
        el.style.fontSize = '14px !important';
      }
      
      if (el.tagName === 'TD' || el.tagName === 'TH') {
        el.style.padding = '8px 12px !important';
        el.style.fontSize = '14px !important';
        el.style.border = '1px solid #ddd !important';
      }
    });
    
    clone.className += ' pdf-clone';
    document.body.appendChild(clone);
    
    // Force layout recalculation
    clone.offsetHeight;
    
    // Wait for fonts to apply
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return clone;
  }

  private async createPdfFromImage(imageData: string, canvasWidth: number, canvasHeight: number): Promise<Blob> {
    // Use A4 format with better scaling
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // A4 dimensions in mm
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10; // Reasonable margin
    const maxWidth = pageWidth - (margin * 2);
    const maxHeight = pageHeight - (margin * 2);
    
    // Calculate aspect ratio
    const aspectRatio = canvasWidth / canvasHeight;
    
    // Calculate dimensions to fit content properly
    let imgWidth = maxWidth;
    let imgHeight = maxWidth / aspectRatio;
    
    // If height exceeds page, scale to fit height instead
    if (imgHeight > maxHeight) {
      imgHeight = maxHeight;
      imgWidth = maxHeight * aspectRatio;
    }
    
    // Center the content
    const xPos = (pageWidth - imgWidth) / 2;
    const yPos = margin;
    
    try {
      // Add image to PDF with maximum quality settings
      pdf.addImage(
        imageData, 
        'JPEG', 
        xPos, 
        yPos, 
        imgWidth, 
        imgHeight, 
        undefined, 
        'FAST' // Use FAST compression for better quality
      );
      
      // Handle multi-page content if needed
      const contentHeightInMM = (canvasHeight * imgWidth) / canvasWidth;
      
      if (contentHeightInMM > maxHeight) {
        const pagesNeeded = Math.ceil(contentHeightInMM / maxHeight);
        
        for (let page = 1; page < pagesNeeded; page++) {
          pdf.addPage();
          
          // Calculate the portion of the image for this page
          const pageStartY = (page * maxHeight * canvasWidth) / imgWidth;
          const pageHeight = Math.min(maxHeight, contentHeightInMM - (page * maxHeight));
          
          // Create canvas for this page section
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvasWidth;
          pageCanvas.height = (pageHeight * canvasWidth) / imgWidth;
          
          const ctx = pageCanvas.getContext('2d');
          if (ctx) {
            const img = new Image();
            await new Promise<void>((resolve) => {
              img.onload = () => {
                ctx.drawImage(
                  img, 
                  0, 
                  pageStartY, 
                  canvasWidth, 
                  pageCanvas.height,
                  0, 
                  0, 
                  canvasWidth, 
                  pageCanvas.height
                );
                const pageImageData = pageCanvas.toDataURL('image/jpeg', 1.0);
                pdf.addImage(pageImageData, 'JPEG', xPos, yPos, imgWidth, pageHeight, undefined, 'FAST');
                resolve();
              };
              img.src = imageData;
            });
          }
        }
      }
      
      return pdf.output('blob');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`PDF generation failed: ${errorMessage}`);
    }
  }

  private async waitForElementReady(element: HTMLElement): Promise<void> {
    // Wait for fonts
    if (document.fonts) {
      await document.fonts.ready;
    }
    
    // Wait for images
    const images = element.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
    const imagePromises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      
      return new Promise<void>((resolve) => {
        const timer = setTimeout(() => resolve(), 5000); // Increased timeout
        img.onload = img.onerror = () => {
          clearTimeout(timer);
          resolve();
        };
      });
    });
    
    await Promise.all(imagePromises);
    
    // Longer delay to ensure all fonts and styles are applied
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async fetchPdfBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    return response.blob();
  }

  // Debug method to help identify issues
  debugElement(elementId: string): void {
    const element = document.getElementById(elementId);
    
    if (!element) {
      console.error(`Element with ID '${elementId}' not found`);
      return;
    }

    console.log('=== ELEMENT DEBUG INFO ===');
    console.log('Element:', element);
    console.log('Element tag:', element.tagName);
    console.log('Element classes:', element.className);
    console.log('Element innerHTML length:', element.innerHTML.length);
    
    const rect = element.getBoundingClientRect();
    console.log('BoundingClientRect:', rect);
    console.log('OffsetWidth/Height:', element.offsetWidth, element.offsetHeight);
    console.log('ScrollWidth/Height:', element.scrollWidth, element.scrollHeight);
    console.log('ClientWidth/Height:', element.clientWidth, element.clientHeight);
    
    const computedStyle = window.getComputedStyle(element);
    console.log('Display:', computedStyle.display);
    console.log('Visibility:', computedStyle.visibility);
    console.log('Opacity:', computedStyle.opacity);
    console.log('Position:', computedStyle.position);
    console.log('Font-size:', computedStyle.fontSize);
    
    // Check parents
    let parent = element.parentElement;
    let level = 1;
    while (parent && level <= 5) {
      const parentStyle = window.getComputedStyle(parent);
      console.log(`Parent ${level}:`, parent.tagName, {
        display: parentStyle.display,
        visibility: parentStyle.visibility,
        opacity: parentStyle.opacity,
        fontSize: parentStyle.fontSize
      });
      parent = parent.parentElement;
      level++;
    }
    
    console.log('=== END DEBUG INFO ===');
  }
}