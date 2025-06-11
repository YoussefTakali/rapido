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
        scale: 2, // Higher scale for better text quality
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
        }
      });

      // Validate canvas
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas creation failed - element may be empty');
      }

      // Convert to high quality JPEG with better compression
      const imageData = canvas.toDataURL('image/jpeg', 0.98);
      
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
          scale: 2,
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

        // Convert to JPEG
        const imageData = canvas.toDataURL('image/jpeg', 0.98);
        
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
    
    // Apply styles to make clone render properly with better text scaling
    clone.style.cssText += `
      position: absolute !important;
      left: -9999px !important;
      top: 0 !important;
      width: 100% !important;
      height: auto !important;
      transform: scale(1) !important;
      zoom: 1 !important;
      font-size: inherit !important;
      line-height: inherit !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      overflow: visible !important;
      max-width: none !important;
      max-height: none !important;
    `;
    
    clone.className += ' pdf-clone';
    document.body.appendChild(clone);
    
    // Force layout recalculation
    clone.offsetHeight;
    
    return clone;
  }

  private async createPdfFromImage(imageData: string, canvasWidth: number, canvasHeight: number): Promise<Blob> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Use full A4 dimensions with minimal margins
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 5; // Small margin for better appearance
    const maxWidth = pageWidth - (margin * 2); // Use almost full width
    const maxHeight = pageHeight - (margin * 2); // Use almost full height
    
    // Calculate aspect ratio
    const aspectRatio = canvasWidth / canvasHeight;
    
    // Start with full width utilization
    let imgWidth = maxWidth;
    let imgHeight = maxWidth / aspectRatio;
    
    // If height exceeds page, scale to fit height instead
    if (imgHeight > maxHeight) {
      imgHeight = maxHeight;
      imgWidth = maxHeight * aspectRatio;
    }
    
    // Position with minimal margins (left-aligned for better text readability)
    const xPos = margin;
    const yPos = margin;
    
    try {
      // Add image to PDF with higher quality
      pdf.addImage(imageData, 'JPEG', xPos, yPos, imgWidth, imgHeight, undefined, 'FAST');
      
      // Handle multi-page content if needed
      if (canvasHeight > canvasWidth * 1.5) { // If content is very tall
        const pagesNeeded = Math.ceil(imgHeight / maxHeight);
        
        if (pagesNeeded > 1) {
          // Split content across multiple pages
          const pageContentHeight = canvasHeight / pagesNeeded;
          
          for (let page = 1; page < pagesNeeded; page++) {
            pdf.addPage();
            
            // Create a new canvas for this page section
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvasWidth;
            pageCanvas.height = pageContentHeight;
            
            const ctx = pageCanvas.getContext('2d');
            if (ctx) {
              const img = new Image();
              img.onload = () => {
                ctx.drawImage(img, 0, -page * pageContentHeight);
                const pageImageData = pageCanvas.toDataURL('image/jpeg', 0.98);
                pdf.addImage(pageImageData, 'JPEG', xPos, yPos, imgWidth, maxHeight, undefined, 'FAST');
              };
              img.src = imageData;
            }
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
        const timer = setTimeout(() => resolve(), 3000); // 3s timeout
        img.onload = img.onerror = () => {
          clearTimeout(timer);
          resolve();
        };
      });
    });
    
    await Promise.all(imagePromises);
    
    // Small delay to ensure rendering is complete
    await new Promise(resolve => setTimeout(resolve, 500));
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
    console.log('Z-Index:', computedStyle.zIndex);
    
    // Check parents
    let parent = element.parentElement;
    let level = 1;
    while (parent && level <= 5) {
      const parentStyle = window.getComputedStyle(parent);
      console.log(`Parent ${level}:`, parent.tagName, {
        display: parentStyle.display,
        visibility: parentStyle.visibility,
        opacity: parentStyle.opacity
      });
      parent = parent.parentElement;
      level++;
    }
    
    console.log('=== END DEBUG INFO ===');
  }
}