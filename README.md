# FinWise - Personal Finance Management System

FinWise is a comprehensive personal finance management web application designed specifically for Indian users. It helps users track their income, expenses, analyze spending patterns, and get personalized financial recommendations.

## Features

### 🔐 User Authentication
- Secure user registration and login
- JWT-based authentication
- User profile management

### 💰 Income & Expense Tracking
- Track multiple income sources (salary, freelancing, business, etc.)
- Categorize expenses across 15+ categories
- Upload and process receipts (PDF/Image) with OCR text extraction
- Real-time financial calculations

### 📊 Interactive Dashboard
- Financial overview with key metrics
- Recent transactions display
- Quick action buttons
- Profile editing capabilities

### 🎯 Smart Recommendations
- Personalized savings and investment suggestions
- Monthly and yearly financial analysis
- Goal tracking with progress monitoring
- Category-wise spending alerts
- Investment recommendations (SIP, PPF, ELSS, etc.)

### 📈 Data Visualization
- Interactive charts using Chart.js
- Monthly expense trends
- Category-wise spending breakdown
- Spending pattern analysis
- Financial insights and alerts

### 🇮🇳 India-Specific Features
- Currency in Indian Rupees (₹)
- Investment recommendations suitable for Indian market
- Tax-saving investment suggestions (80C)
- Indian financial instruments (PPF, ELSS, NSC, etc.)

## Technology Stack

### Frontend
- **React 18** - Modern UI library
- **React Router** - Client-side routing
- **Chart.js** - Interactive charts and graphs
- **Axios** - HTTP client
- **Lucide React** - Modern icons
- **React Toastify** - Notifications

### Backend
- **Python Flask** - Web framework
- **MongoDB** - NoSQL database
- **PyJWT** - JWT authentication
- **PyPDF2** - PDF text extraction
- **Pytesseract** - OCR for image text extraction
- **Pillow** - Image processing

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB (local or cloud instance)
- Tesseract OCR (for receipt processing)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\\Scripts\\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Install Tesseract OCR:**
   
   **Windows:**
   - Download from: https://github.com/UB-Mannheim/tesseract/wiki
   - Add to PATH or update pytesseract config
   
   **macOS:**
   ```bash
   brew install tesseract
   ```
   
   **Ubuntu/Debian:**
   ```bash
   sudo apt-get install tesseract-ocr
   ```

5. **Start MongoDB:**
   - Ensure MongoDB is running on `mongodb://localhost:27017/`
   - Or update connection string in `app.py`

6. **Run the Flask server:**
   ```bash
   python app.py
   ```
   
   Server will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   
   Application will open on `http://localhost:3000`

## Usage Guide

### Getting Started

1. **Register Account:**
   - Visit the registration page
   - Fill in personal details (name, email, phone, DOB, gender)
   - Create a secure password

2. **Add Income Sources:**
   - Navigate to Income page
   - Add your salary, freelancing income, or other sources
   - Specify frequency (monthly/yearly/one-time)

3. **Track Expenses:**
   - Go to Expense page
   - Manually add expenses or upload receipts
   - Categorize spending for better analysis

4. **View Recommendations:**
   - Check the Recommendations page for personalized advice
   - Set savings goals and track progress
   - Get investment suggestions based on your profile

5. **Analyze Spending:**
   - Use the Visualization page to see spending patterns
   - View monthly trends and category breakdowns
   - Get insights on your financial behavior

### Receipt Processing

The application can extract expense data from uploaded receipts:

- **Supported formats:** PDF, JPEG, PNG
- **Maximum file size:** 5MB
- **Processing:** Automatic text extraction and amount detection
- **Review:** Always review extracted data before saving

### Investment Recommendations

Based on your savings rate and income, FinWise suggests:

- **Emergency Fund:** Low-risk savings for emergencies
- **SIP Investments:** Mutual funds for wealth creation
- **Tax Saving:** 80C investments (ELSS, PPF, NSC)
- **Gold Investment:** Inflation hedge through Gold ETFs

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile

### Income Management
- `POST /api/income` - Add income
- `GET /api/income` - Get user income

### Expense Management
- `POST /api/expense` - Add expense
- `GET /api/expense` - Get user expenses
- `POST /api/upload-receipt` - Process receipt upload

### Analytics
- `GET /api/recommendations` - Get financial recommendations
- `GET /api/visualization` - Get visualization data

## Security Features

- **Password Hashing:** Werkzeug security for password protection
- **JWT Authentication:** Secure token-based authentication
- **Input Validation:** Server-side validation for all inputs
- **File Upload Security:** Type and size validation for uploads
- **CORS Protection:** Configured for secure cross-origin requests

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@finwise.com or create an issue in the GitHub repository.

## Acknowledgments

- Chart.js for beautiful data visualizations
- Lucide React for modern icons
- MongoDB for flexible data storage
- Flask for the robust backend framework

---

**FinWise** - Take control of your financial future! 💰📈
