// =====================
// CONFIGURATION FILE
// =====================
// This file shows how to customize various aspects of the application
// Copy values from here into the appropriate files to customize

// =====================
// COMPANY BRANDING
// =====================

// Company Name (appears in header and PDF)
COMPANY_NAME = "ELCORP NAMIBIA"
COMPANY_TAGLINE = "Professional Business Solutions"
COMPANY_PHONE = "+264 61 123 4567"
COMPANY_EMAIL = "info@elcorp.com.na"
COMPANY_WEBSITE = "www.elcorp.com.na"

// =====================
// COLOR SCHEME
// =====================
// Update in public/styles.css lines 12-17

PRIMARY_COLOR = "#003366"           // Main brand color (dark blue)
SECONDARY_COLOR = "#FF6600"         // Accent color (orange)
ACCENT_COLOR = "#00A8E8"            // Highlight color (light blue)
SUCCESS_COLOR = "#27AE60"           // Success messages (green)
DANGER_COLOR = "#E74C3C"            // Error messages (red)
DARK_GRAY = "#2C3E50"               // Text color
LIGHT_GRAY = "#ECF0F1"              // Background
BORDER_COLOR = "#BDC3C7"            // Border color

// =====================
// PDF STYLING
// =====================
// Update in server.js PDF generation section (lines 60-150)

PDF_PAGE_SIZE = "A4"
PDF_MARGIN = 40                     // pixels
PDF_HEADER_FONT_SIZE = 20           // pixels
PDF_HEADER_FONT = "Helvetica-Bold"
PDF_BODY_FONT = "Helvetica"
PDF_TABLE_HEADER_BG = "#1a1a1a"     // Dark background for table headers
PDF_TABLE_HEADER_TEXT = "#ffffff"   // White text for table headers
PDF_LINE_COLOR = "#333333"          // Color for horizontal lines
PDF_FOOTER_COLOR = "#666666"        // Footer text color

// =====================
// DEFAULT VALUES
// =====================

DEFAULT_TAX_RATE = 15               // Percentage (%)
DEFAULT_DISCOUNT = 0                // Percentage (%)
QUOTATION_VALIDITY_DAYS = 30        // Days the quotation is valid
DEFAULT_CURRENCY = "NAD"            // Namibian Dollar
CURRENCY_SYMBOL = "N$"              // Display symbol

// =====================
// PORTS & NETWORK
// =====================

SERVER_PORT = 3000                  // Change via PORT environment variable
SERVER_HOST = "localhost"
API_BASE_URL = "http://localhost:3000"

// =====================
// DATA STORAGE
// =====================

QUOTATIONS_FILE = "data/quotations.json"
DATA_DIRECTORY = "data"

// =====================
// FORM VALIDATION
// =====================

MIN_CLIENT_NAME_LENGTH = 2
MIN_PRODUCT_NAME_LENGTH = 2
MAX_DISCOUNT_PERCENT = 100
MAX_TAX_PERCENT = 100
REQUIRED_FIELDS = ["clientName", "clientEmail", "clientPhone", "items"]

// =====================
// PDF CONTENT
// =====================

PDF_QUOTATION_TITLE = "QUOTATION"
PDF_TABLE_HEADERS = ["Description", "Qty", "Unit Price", "Total"]
PDF_FOOTER_LINE1 = "Professional Solutions for Your Business"
PDF_FOOTER_LINE2 = "This quotation is valid for 30 days from the date of issue."
PDF_FOOTER_LINE3 = "Thank you for considering Elcorp Namibia!"

// =====================
// NOTIFICATIONS
// =====================

MESSAGE_PDF_SUCCESS = "Quotation PDF generated successfully!"
MESSAGE_SAVE_SUCCESS = "Quotation saved successfully!"
MESSAGE_CLIENT_NAME_REQUIRED = "Please enter client name"
MESSAGE_EMAIL_INVALID = "Please enter a valid email address"
MESSAGE_PHONE_REQUIRED = "Please enter client phone number"
MESSAGE_ITEMS_REQUIRED = "Please add at least one product/service"
MESSAGE_PDF_ERROR = "Failed to generate PDF. Please try again."
MESSAGE_SAVE_ERROR = "Failed to save quotation. Please try again."

// =====================
// RESPONSIVE DESIGN BREAKPOINTS
// =====================
// Update in public/styles.css media queries

BREAKPOINT_TABLET = 768             // pixels
BREAKPOINT_MOBILE = 480             // pixels

// =====================
// ANIMATION TIMING
// =====================

NOTIFICATION_DISPLAY_TIME = 4000    // milliseconds
ANIMATION_DURATION = 300            // milliseconds (CSS transitions)
ANIMATION_SLIDE_DISTANCE = 400      // pixels

// =====================
// HOW TO USE THIS FILE
// =====================

/*
1. COMPANY BRANDING
   - Update COMPANY_NAME in:
     * server.js (line 65)
     * public/index.html (line 30)
   
2. COLORS
   - Update color values in:
     * public/styles.css (lines 12-19)
   
3. TAX RATE
   - Update DEFAULT_TAX_RATE in:
     * public/index.html (line 114)
   
4. FOOTER TEXT
   - Update PDF_FOOTER_LINE1/2/3 in:
     * server.js (lines 140-142)
   
5. CONTACT INFO
   - Update in:
     * server.js (lines 66-71)
     * public/index.html (line 34-36)
   
6. PORTS
   - Start server with: PORT=8080 npm start
   - Or update in server.js line 9

7. NOTIFICATIONS
   - Update messages in:
     * public/script.js (validation section)

*/
