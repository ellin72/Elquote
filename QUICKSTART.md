# 🚀 Quick Start Guide - Elcorp Namibia Quotation Generator

## What's Included

Your complete quotation generation application is ready to use! Here's what you get:

### ✅ Complete Features
- Professional, responsive web interface
- Dynamic product/service table with real-time calculations
- Automatic PDF generation with professional branding
- Quotation history storage (JSON)
- Mobile-friendly design
- No authentication needed for MVP

### 📦 Project Files

```
Elquote/
├── server.js                    # Backend (Express + PDF generation)
├── public/
│   ├── index.html              # Web interface
│   ├── styles.css              # Responsive styling
│   └── script.js               # Client-side logic
├── data/
│   └── quotations.json         # Quotation history
├── package.json                # Dependencies
└── README.md                   # Full documentation
```

## 🎯 Getting Started (5 Minutes)

### Step 1: Install Dependencies
```bash
cd Elquote
npm install
```

### Step 2: Start the Server
```bash
npm start
```

You'll see:
```
╔════════════════════════════════════════════════════════╗
║   ELCORP NAMIBIA - QUOTATION GENERATOR               ║
║   Server running on http://localhost:3000              ║
║   Press Ctrl+C to stop                                 ║
╚════════════════════════════════════════════════════════╝
```

### Step 3: Open in Browser
Go to: **http://localhost:3000**

## 📝 How to Use

### Creating Your First Quotation

1. **Enter Client Information**
   - Client Name: "ABC Corporation"
   - Email: "contact@abc.com"
   - Phone: "+264 61 234 5678"
   - Date: (auto-filled to today)

2. **Add Products/Services**
   - Click **+ Add Item**
   - Product Name: "Software Development"
   - Description: "Custom application"
   - Quantity: "100"
   - Unit Price: "500"
   - → Total updates automatically: N$50,000

3. **Set Pricing**
   - Discount: "10%" (optional)
   - Tax Rate: "15%" (default)
   - Watch the summary update!

4. **Generate Quotation**
   - Click **📄 Download PDF** → Saves to your Downloads folder
   - Click **💾 Save Quotation** → Stores in history
   - Click **🔄 Reset Form** → Start a new quotation

## 💡 Tips & Tricks

### Real-Time Calculations
- All totals update instantly as you type
- Perfect for adjusting prices on the fly
- Discount and tax automatically calculated

### Mobile Friendly
- Works on phones and tablets
- Responsive design adapts to all screen sizes
- Touch-friendly buttons and inputs

### Professional PDFs
- Company branding included
- Clean, print-ready format
- 30-day validity notice
- Professional footer with contact info

## 🔧 Customization

### Change Company Colors
Edit `public/styles.css` (line 12-17):
```css
:root {
    --primary-color: #003366;      /* Change this */
    --secondary-color: #FF6600;    /* And this */
}
```

### Update Company Info
Edit `server.js` (line 65-75) and `public/index.html` (line 29-32)

### Adjust Tax Rate
Edit `public/index.html` (line 114):
```html
<input type="number" id="taxPercent" value="15">  <!-- Change 15 to your rate -->
```

## 🌐 Access from Other Devices

To access from other computers/phones on your network:

1. Find your computer's IP address:
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.1.100)

2. On another device, visit:
   ```
   http://192.168.1.100:3000
   ```

## 📊 Sample Data

Try these numbers to test:

**Service Package Example:**
- Web Design (80 hours @ N$400/hour) = N$32,000
- Hosting Setup (5 hours @ N$200/hour) = N$1,000
- Support (20 hours @ N$250/hour) = N$5,000
- Subtotal: N$38,000
- Discount (5%): -N$1,900
- After Discount: N$36,100
- Tax (15%): N$5,415
- **Grand Total: N$41,515**

## 🐛 Troubleshooting

### "Cannot find module" error
```bash
npm install
```

### Port 3000 already in use
```bash
PORT=3001 npm start
# Then visit http://localhost:3001
```

### Styles look broken
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### PDF won't download
- Check if pop-ups are blocked in your browser
- Ensure all fields are filled correctly

## 🚀 Next Steps

### Ready for Production?
1. Add user authentication (see README.md)
2. Use a real database instead of JSON
3. Set up HTTPS
4. Add email integration
5. Deploy to a server

### Want More Features?
The application is modular and easy to expand:
- Add email sending
- Export to Excel/CSV
- Client management
- Templates
- Digital signatures

## 📚 Full Documentation

See `README.md` for:
- Complete API documentation
- All customization options
- Technology stack details
- Security recommendations
- Future enhancement ideas

## 💬 Need Help?

1. **Check the README.md** - Comprehensive guide
2. **Review API endpoints** - See server.js and README
3. **Browser DevTools** - Open F12 to see console messages
4. **Terminal Output** - Watch server logs for errors

## ✨ You're All Set!

Your professional quotation generator is ready to use. Start creating quotations and impress your clients with professional PDFs!

Happy quoting! 🎉

---

**Server Port:** 3000  
**Application:** http://localhost:3000  
**Data Storage:** data/quotations.json  
**Last Updated:** February 11, 2026
