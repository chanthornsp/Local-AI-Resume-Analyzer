"""
Enhanced PDF and Image Text Extractor

Handles text extraction from:
- Text-based PDFs (pdfplumber)
- Scanned PDFs (OCR)
- Image files (PNG, JPG, JPEG)
"""
import pdfplumber
import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import re
from pathlib import Path
from typing import Optional


class PDFExtractor:
    """Extract text from PDF files and images using pdfplumber and pytesseract (OCR)"""

    # Supported file extensions
    PDF_EXTENSIONS = {'.pdf'}
    IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.tif'}
    
    def __init__(self, use_ocr: bool = True):
        """
        Initialize PDF/Image extractor.
        
        Args:
            use_ocr: Whether to use OCR for image-based content
        """
        self.use_ocr = use_ocr

    def extract_text(self, file_path: str) -> str:
        """
        Extract text from PDF or image file.

        Args:
            file_path: Path to PDF or image file

        Returns:
            Extracted text as string

        Raises:
            ValueError: If text extraction fails or insufficient text
        """
        path = Path(file_path)
        extension = path.suffix.lower()
        
        try:
            # Route to appropriate extractor based on file type
            if extension in self.PDF_EXTENSIONS:
                text = self._extract_from_pdf(file_path)
            elif extension in self.IMAGE_EXTENSIONS:
                text = self._extract_from_image(file_path)
            else:
                raise ValueError(f"Unsupported file type: {extension}")
            
            # Clean and validate
            text = self._clean_text(text)

            if len(text.strip()) < 50:  # Lowered threshold for short CVs
                raise ValueError(
                    f"Insufficient text extracted ({len(text.strip())} chars). "
                    f"File may be empty, corrupted, or image-based without OCR."
                )

            return text

        except Exception as e:
            raise ValueError(f"Failed to extract text from {path.name}: {str(e)}")

    def _extract_from_pdf(self, pdf_path: str) -> str:
        """
        Extract text from PDF file.
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            Extracted text
        """
        # Try pdfplumber first (for text-based PDFs)
        text = self._extract_with_pdfplumber(pdf_path)

        # If insufficient text and OCR enabled, try OCR
        if len(text.strip()) < 100 and self.use_ocr:
            print(f"  ℹ️  PDF appears to be scanned, using OCR...")
            text = self._extract_pdf_with_ocr(pdf_path)

        return text

    def _extract_from_image(self, image_path: str) -> str:
        """
        Extract text from image file using OCR.
        
        Args:
            image_path: Path to image file
            
        Returns:
            Extracted text
        """
        if not self.use_ocr:
            raise ValueError("OCR is disabled, cannot extract text from images")
        
        try:
            # Open and preprocess image
            img = Image.open(image_path)
            img = self._preprocess_image(img)
            
            # Extract text using Tesseract
            text = pytesseract.image_to_string(img)
            
            return text
        except Exception as e:
            raise ValueError(f"Failed to extract text from image: {str(e)}")

    def _extract_with_pdfplumber(self, pdf_path: str) -> str:
        """Extract text using pdfplumber (for text-based PDFs)"""
        text = ""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages, 1):
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n\n"
        except Exception as e:
            print(f"  ⚠️  pdfplumber extraction failed: {e}")
        return text

    def _extract_pdf_with_ocr(self, pdf_path: str) -> str:
        """Extract text using OCR for scanned PDFs"""
        text = ""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages, 1):
                    # Convert page to image
                    img = page.to_image(resolution=300)  # Higher resolution for better OCR
                    
                    # Preprocess the image
                    pil_img = self._preprocess_image(img.original)
                    
                    # Extract text
                    page_text = pytesseract.image_to_string(pil_img)
                    if page_text:
                        text += page_text + "\n\n"
        except Exception as e:
            print(f"  ⚠️  OCR extraction failed: {e}")
        return text

    def _preprocess_image(self, img: Image.Image) -> Image.Image:
        """
        Preprocess image for better OCR accuracy.
        
        Args:
            img: PIL Image object
            
        Returns:
            Preprocessed image
        """
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Convert to grayscale
        img = img.convert('L')
        
        # Enhance contrast
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(2.0)
        
        # Sharpen
        img = img.filter(ImageFilter.SHARPEN)
        
        # Optional: Resize if image is too small or too large
        width, height = img.size
        if width < 1000 or height < 1000:
            # Upscale small images
            scale_factor = max(1000 / width, 1000 / height)
            new_size = (int(width * scale_factor), int(height * scale_factor))
            img = img.resize(new_size, Image.Resampling.LANCZOS)
        
        return img

    def _clean_text(self, text: str) -> str:
        """
        Clean extracted text.
        
        Args:
            text: Raw extracted text
            
        Returns:
            Cleaned text
        """
        # Normalize whitespace (but preserve newlines for structure)
        text = re.sub(r' +', ' ', text)  # Multiple spaces to single space
        text = re.sub(r'\n\s+\n', '\n\n', text)  # Clean up excessive newlines
        text = re.sub(r'\n{3,}', '\n\n', text)  # Max 2 consecutive newlines
        
        # Remove non-printable characters (but keep newlines)
        text = ''.join(char for char in text if char.isprintable() or char == '\n')
        
        # Remove common OCR artifacts
        text = re.sub(r'[|]{2,}', '', text)  # Multiple pipes
        text = re.sub(r'_{3,}', '', text)   # Multiple underscores
        
        return text.strip()

    @staticmethod
    def get_file_type(file_path: str) -> str:
        """
        Determine file type.
        
        Args:
            file_path: Path to file
            
        Returns:
            'pdf' or 'image' or 'unknown'
        """
        extension = Path(file_path).suffix.lower()
        if extension in PDFExtractor.PDF_EXTENSIONS:
            return 'pdf'
        elif extension in PDFExtractor.IMAGE_EXTENSIONS:
            return 'image'
        else:
            return 'unknown'

