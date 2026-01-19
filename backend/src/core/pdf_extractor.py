import pdfplumber
import pytesseract
from PIL import Image
import re
from typing import Optional

class PDFExtractor:
    """Extract text from PDF files using pdfplumber and pytesseract (OCR fallback)"""

    def __init__(self, use_ocr: bool = True):
        self.use_ocr = use_ocr

    def extract_text(self, pdf_path: str) -> str:
        """
        Extract text from PDF file

        Args:
            pdf_path: Path to PDF file

        Returns:
            Extracted text as string

        Raises:
            ValueError: If text extraction fails or insufficient text
        """
        try:
            # Try pdfplumber first (for text-based PDFs)
            text = self._extract_with_pdfplumber(pdf_path)

            # If insufficient text and OCR enabled, try OCR
            if len(text.strip()) < 100 and self.use_ocr:
                text = self._extract_with_ocr(pdf_path)

            # Clean and validate
            text = self._clean_text(text)

            if len(text.strip()) < 100:
                raise ValueError(
                    "Insufficient text extracted. PDF may be image-based or empty."
                )

            return text

        except Exception as e:
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")

    def _extract_with_pdfplumber(self, pdf_path: str) -> str:
        """Extract text using pdfplumber"""
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
        return text

    def _extract_with_ocr(self, pdf_path: str) -> str:
        """Extract text using OCR (pytesseract)"""
        text = ""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    img = page.to_image()
                    page_text = pytesseract.image_to_string(img.original)
                    if page_text:
                        text += page_text + "\n\n"
        except Exception as e:
            print(f"OCR extraction failed: {e}")
        return text

    def _clean_text(self, text: str) -> str:
        """Clean extracted text"""
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[^\x20-\x7E\n]', '', text)
        return text.strip()
