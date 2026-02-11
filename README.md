# 🏢 Elcorp Namibia - Quotation Generator

A professional, responsive web application for generating and managing business quotations for Elcorp Namibia. Create professional PDF quotations instantly with automatic calculations, branding, and email-ready formatting.

## ✨ Features

### Frontend
- **Clean & Professional UI** - Modern, responsive design that works on all devices
- **Elcorp Branding** - Integrated company logo, colors, and professional footer
- **Client Information Form** - Quick entry for client details
- **Dynamic Product/Service Table** - Add/remove items on the fly
- **Real-Time Calculations** - Auto-update totals, discounts, and taxes
- **Responsive Design** - Mobile, tablet, and desktop optimized
- **Professional Summary** - Quick overview of pricing breakdown

### Backend
- **Express.js Server** - Fast, lightweight Node.js backend
- **PDF Generation** - High-quality PDF exports with professional formatting
- **Data Persistence** - Store quotation history in JSON
- **RESTful API** - Easy-to-use endpoints for frontend integration
- **Zero Authentication** - MVP-ready, no login required

### PDF Features
- Company header with logo and branding
- Client details section
- Itemized table with descriptions, quantities, and prices
- Automatic calculations (subtotal, discount, tax)
- Professional footer with company information
- Print-ready formatting

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)

### Installation

1. **Navigate to project directory:**
   ```bash
   cd Elquote
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

That's it! The application is ready to use.

## 📖 Usage Guide

### Creating a Quotation

1. **Fill in Client Information**
   - Client Name *
   - Email Address *
   - Phone Number *
   - Quotation Date (auto-filled to today)

2. **Add Products/Services**
   - Click **+ Add Item** to add products or services
   - Enter:
     - Product/Service Name
     - Description
     - Quantity
     - Unit Price (in Namibian Dollars)
   - Totals calculate automatically

3. **Configure Pricing**
   - Set discount percentage (optional)
   - Adjust tax rate (default 15%)
   - View summary with real-time calculations

4. **Generate Quotation**
   - Click **📄 Download PDF** to export
   - Click **💾 Save Quotation** to store in history
   - Click **🔄 Reset Form** to start over

### Example Quotation
```
Client: ABC Corporation
Items:
  - Software Development (100 hours @ N$500/hour) = N$50,000
  - Technical Support (50 hours @ N$300/hour) = N$15,000
Subtotal: N$65,000
Discount (10%): -N$6,500
Subtotal after discount: N$58,500
Tax (15%): N$8,775
Grand Total: N$67,275
```

## 📁 Project Structure

```
Elquote/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # Responsive styling
│   └── script.js          # Frontend logic
├── data/                  # Data storage
│   └── quotations.json    # Quotation history
├── server.js              # Express backend
├── package.json           # Dependencies
├── .gitignore             # Git configuration
└── README.md              # This file
```

## 🛠️ API Endpoints

### GET `/api/quotations`
Retrieve all saved quotations.

**Response:**
```json
[
  {
    "id": 1707635400000,
    "clientName": "ABC Corporation",
    "clientEmail": "contact@abc.com",
    "clientPhone": "+264 61 234 5678",
    "quotationDate": "2026-02-11",
    "items": [...],
    "discount": 10,
    "tax": 15,
    "createdAt": "2026-02-11T10:30:00.000Z"
  }
]
```

### POST `/api/generate-pdf`
Generate and download a PDF quotation.

**Request Body:**
```json
{
  "clientName": "ABC Corporation",
  "clientEmail": "contact@abc.com",
  "clientPhone": "+264 61 234 5678",
  "quotationDate": "2026-02-11",
  "items": [
    {
      "name": "Software Development",
      "description": "Custom application",
      "quantity": 100,
      "unitPrice": 500
    }
  ],
  "discount": 10,
  "tax": 15
}
```

**Response:** PDF file for download

### POST `/api/save-quotation`
Save quotation to history.

**Request Body:** (same as generate-pdf)

**Response:**
```json
{
  "success": true,
  "quotation": {
    "id": 1707635400000,
    "...": "..."
  }
}
```

## 💻 Technology Stack

- **Frontend:**
  - HTML5
  - CSS3 (Responsive Grid & Flexbox)
  - Vanilla JavaScript (no frameworks)
  - Fetch API

- **Backend:**
  - Node.js
  - Express.js
  - PDFKit (PDF generation)
  - Body-parser (JSON parsing)

- **Data:**
  - JSON file storage (no database required)

## 🎨 Customization

### Update Company Branding

Edit `server.js` (lines 65-75 in PDF generation):
```javascript
doc.fontSize(20)
   .font('Helvetica-Bold')
   .text('YOUR COMPANY NAME', 40, 40);  // Change company name
```

Edit `public/index.html` (lines 29-32):
```html
<h1>YOUR COMPANY NAME</h1>
<p>Your tagline here</p>
```

Edit `public/styles.css` (lines 10-16):
```css
:root {
    --primary-color: #003366;      /* Main brand color */
    --secondary-color: #FF6600;    /* Accent color */
    /* ... */
}
```

### Change Tax Rate
Default is 15%. Modify in `public/index.html` line 114:
```html
<input type="number" id="taxPercent" min="0" max="100" value="15" step="0.01">
```

### Adjust PDF Layout
Edit PDF generation in `server.js` (starting at line 120) to customize:
- Margins and spacing
- Font sizes
- Colors and styling
- Footer content

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Security Notes

This is an MVP without authentication. Before deploying to production:
- Add user authentication
- Validate all inputs server-side
- Use HTTPS only
- Add CSRF protection
- Implement rate limiting
- Secure data storage (database instead of JSON)

## 📈 Future Enhancements

- ✅ User authentication & accounts
- ✅ Email integration (SMTP)
- ✅ Quotation templates
- ✅ Client management database
- ✅ Export to Excel/CSV
- ✅ Recurring quotations
- ✅ Multi-currency support
- ✅ Digital signatures
- ✅ Automatic reminders

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 is in use:
```bash
# Use a different port
PORT=3001 npm start
```

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

### PDF Not Generating
- Check browser console for errors
- Ensure all required fields are filled
- Verify server is running on correct port

### Styles Not Loading
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Check console for CSS file errors

## 📝 License

MIT License - Free to use for commercial and personal projects.

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check browser console for errors

## 🎯 Performance Tips

- Quotations are stored locally (JSON file)
- No database overhead
- Minimal dependencies
- Fast PDF generation
- Responsive design optimized for all devices

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [PDFKit Documentation](http://pdfkit.org/)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [JavaScript Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---

**Built with ❤️ for Elcorp Namibia**

*Last Updated: February 11, 2026*
