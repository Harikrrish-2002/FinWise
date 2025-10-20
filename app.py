from flask import Flask, request, jsonify, session
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from bson.objectid import ObjectId
from datetime import datetime, timedelta
import os
import jwt
import PyPDF2
import pytesseract
from PIL import Image
import io
import re

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['UPLOAD_FOLDER'] = 'uploads'
CORS(app, supports_credentials=True)

# MongoDB connection
client = MongoClient('mongodb://localhost:27017/')
db = client['finwise_db']
users_collection = db['users']
income_collection = db['income']
expense_collection = db['expenses']
admins_collection = db['admins']

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Helper function to generate JWT token
def generate_token(user_id):
    payload = {
        'user_id': str(user_id),
        'exp': datetime.utcnow() + timedelta(days=1)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

# Helper function to verify JWT token
def verify_token(token):
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# User Registration
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Check if user already exists
        if users_collection.find_one({'email': data['email']}):
            return jsonify({'error': 'User already exists'}), 400
        
        # Hash password
        hashed_password = generate_password_hash(data['password'])
        
        # Create user document
        user_doc = {
            'firstName': data['firstName'],
            'lastName': data['lastName'],
            'email': data['email'],
            'phone': data['phone'],
            'dateOfBirth': data['dateOfBirth'],
            'gender': data['gender'],
            'password': hashed_password,
            'createdAt': datetime.utcnow()
        }
        
        # Insert user
        result = users_collection.insert_one(user_doc)
        
        # Generate token
        token = generate_token(result.inserted_id)
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': {
                'id': str(result.inserted_id),
                'firstName': data['firstName'],
                'lastName': data['lastName'],
                'email': data['email']
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# User Login
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        # Find user
        user = users_collection.find_one({'email': data['email']})
        
        if not user or not check_password_hash(user['password'], data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate token
        token = generate_token(user['_id'])
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': str(user['_id']),
                'firstName': user['firstName'],
                'lastName': user['lastName'],
                'email': user['email']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get User Profile
@app.route('/api/profile', methods=['GET'])
def get_profile():
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        user_id = verify_token(token)
        
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'id': str(user['_id']),
                'firstName': user['firstName'],
                'lastName': user['lastName'],
                'email': user['email'],
                'phone': user['phone'],
                'dateOfBirth': user['dateOfBirth'],
                'gender': user['gender']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add Income
@app.route('/api/income', methods=['POST'])
def add_income():
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        user_id = verify_token(token)
        
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        data = request.get_json()
        
        income_doc = {
            'userId': ObjectId(user_id),
            'source': data['source'],
            'amount': float(data['amount']),
            'frequency': data['frequency'],  # monthly, yearly, one-time
            'date': datetime.strptime(data['date'], '%Y-%m-%d'),
            'description': data.get('description', ''),
            'createdAt': datetime.utcnow()
        }
        
        result = income_collection.insert_one(income_doc)
        
        return jsonify({
            'message': 'Income added successfully',
            'id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get Income
@app.route('/api/income', methods=['GET'])
def get_income():
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        user_id = verify_token(token)
        
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        income_records = list(income_collection.find({'userId': ObjectId(user_id)}))
        
        for record in income_records:
            record['_id'] = str(record['_id'])
            record['userId'] = str(record['userId'])
            record['date'] = record['date'].strftime('%Y-%m-%d')
            record['createdAt'] = record['createdAt'].isoformat()
        
        return jsonify({'income': income_records}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add Expense
@app.route('/api/expense', methods=['POST'])
def add_expense():
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        user_id = verify_token(token)
        
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        data = request.get_json()
        
        expense_doc = {
            'userId': ObjectId(user_id),
            'category': data['category'],
            'amount': float(data['amount']),
            'date': datetime.strptime(data['date'], '%Y-%m-%d'),
            'description': data.get('description', ''),
            'merchant': data.get('merchant', ''),
            'createdAt': datetime.utcnow()
        }
        
        result = expense_collection.insert_one(expense_doc)
        
        return jsonify({
            'message': 'Expense added successfully',
            'id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get Expenses
@app.route('/api/expense', methods=['GET'])
def get_expenses():
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        user_id = verify_token(token)
        
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        expense_records = list(expense_collection.find({'userId': ObjectId(user_id)}))
        
        for record in expense_records:
            record['_id'] = str(record['_id'])
            record['userId'] = str(record['userId'])
            record['date'] = record['date'].strftime('%Y-%m-%d')
            record['createdAt'] = record['createdAt'].isoformat()
        
        return jsonify({'expenses': expense_records}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Extract text from PDF
def extract_text_from_pdf(file_path):
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
        return text
    except Exception as e:
        return str(e)

# Extract text from image using OCR
def extract_text_from_image(file_path):
    try:
        image = Image.open(file_path)
        text = pytesseract.image_to_string(image)
        return text
    except Exception as e:
        return str(e)

# Parse expense data from extracted text
def parse_expense_data(text):
    # Simple regex patterns to extract common expense information
    amount_pattern = r'₹?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)'
    date_pattern = r'(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})'
    
    amounts = re.findall(amount_pattern, text)
    dates = re.findall(date_pattern, text)
    
    # Get the largest amount (likely the total)
    if amounts:
        amount = max([float(amt.replace(',', '')) for amt in amounts])
    else:
        amount = 0
    
    # Get the first date found
    expense_date = dates[0] if dates else datetime.now().strftime('%d/%m/%Y')
    
    return {
        'amount': amount,
        'date': expense_date,
        'raw_text': text
    }

# Upload Receipt
@app.route('/api/upload-receipt', methods=['POST'])
def upload_receipt():
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        user_id = verify_token(token)
        
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            # Extract text based on file type
            if filename.lower().endswith('.pdf'):
                extracted_text = extract_text_from_pdf(file_path)
            elif filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                extracted_text = extract_text_from_image(file_path)
            else:
                return jsonify({'error': 'Unsupported file format'}), 400
            
            # Parse expense data
            expense_data = parse_expense_data(extracted_text)
            
            # Clean up uploaded file
            os.remove(file_path)
            
            return jsonify({
                'message': 'Receipt processed successfully',
                'data': expense_data
            }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get Recommendations
@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        user_id = verify_token(token)
        
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get user's income and expenses
        user_income = list(income_collection.find({'userId': ObjectId(user_id)}))
        user_expenses = list(expense_collection.find({'userId': ObjectId(user_id)}))
        
        # Calculate monthly income
        monthly_income = sum([inc['amount'] for inc in user_income if inc['frequency'] == 'monthly'])
        yearly_income = sum([inc['amount'] for inc in user_income if inc['frequency'] == 'yearly'])
        monthly_income += yearly_income / 12
        
        # Calculate monthly expenses
        current_month = datetime.now().month
        current_year = datetime.now().year
        monthly_expenses = sum([
            exp['amount'] for exp in user_expenses 
            if exp['date'].month == current_month and exp['date'].year == current_year
        ])
        
        # Calculate savings
        monthly_savings = monthly_income - monthly_expenses
        savings_rate = (monthly_savings / monthly_income * 100) if monthly_income > 0 else 0
        
        # Generate recommendations
        recommendations = []
        
        if savings_rate < 20:
            recommendations.append({
                'type': 'warning',
                'title': 'Low Savings Rate',
                'message': f'Your current savings rate is {savings_rate:.1f}%. Aim for at least 20% of your income.',
                'suggestion': 'Review your expenses and identify areas where you can cut back.'
            })
        
        if monthly_expenses > monthly_income:
            recommendations.append({
                'type': 'alert',
                'title': 'Overspending Alert',
                'message': f'You are spending ₹{monthly_expenses - monthly_income:.2f} more than your income this month.',
                'suggestion': 'Reduce discretionary spending and focus on essential expenses only.'
            })
        
        if savings_rate >= 20:
            recommendations.append({
                'type': 'investment',
                'title': 'Investment Opportunity',
                'message': f'Great job! You\'re saving {savings_rate:.1f}% of your income.',
                'suggestion': 'Consider investing in SIP mutual funds or PPF for long-term wealth building.'
            })
        
        # Category-wise expense analysis
        expense_categories = {}
        for expense in user_expenses:
            if expense['date'].month == current_month and expense['date'].year == current_year:
                category = expense['category']
                expense_categories[category] = expense_categories.get(category, 0) + expense['amount']
        
        # Find highest spending category
        if expense_categories:
            highest_category = max(expense_categories, key=expense_categories.get)
            highest_amount = expense_categories[highest_category]
            
            if highest_amount > monthly_income * 0.3:
                recommendations.append({
                    'type': 'category_alert',
                    'title': f'High {highest_category} Spending',
                    'message': f'You\'re spending ₹{highest_amount:.2f} on {highest_category} this month.',
                    'suggestion': f'Consider reducing {highest_category} expenses by 10-15%.'
                })
        
        return jsonify({
            'monthly_income': monthly_income,
            'monthly_expenses': monthly_expenses,
            'monthly_savings': monthly_savings,
            'savings_rate': savings_rate,
            'recommendations': recommendations,
            'expense_categories': expense_categories
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get Visualization Data
@app.route('/api/visualization', methods=['GET'])
def get_visualization_data():
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        user_id = verify_token(token)
        
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get expenses for the last 6 months
        six_months_ago = datetime.now() - timedelta(days=180)
        user_expenses = list(expense_collection.find({
            'userId': ObjectId(user_id),
            'date': {'$gte': six_months_ago}
        }))
        
        # Monthly expense data
        monthly_data = {}
        category_data = {}
        
        for expense in user_expenses:
            month_key = expense['date'].strftime('%Y-%m')
            category = expense['category']
            amount = expense['amount']
            
            # Monthly totals
            monthly_data[month_key] = monthly_data.get(month_key, 0) + amount
            
            # Category totals
            category_data[category] = category_data.get(category, 0) + amount
        
        # Format data for charts
        months = sorted(monthly_data.keys())
        monthly_amounts = [monthly_data[month] for month in months]
        
        categories = list(category_data.keys())
        category_amounts = list(category_data.values())
        
        return jsonify({
            'monthly_chart': {
                'labels': months,
                'data': monthly_amounts
            },
            'category_chart': {
                'labels': categories,
                'data': category_amounts
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Admin Registration
@app.route('/api/admin/register', methods=['POST'])
def admin_register():
    try:
        data = request.get_json()
        
        # Check if admin already exists
        if admins_collection.find_one({'adminName': data['adminName']}):
            return jsonify({'error': 'Admin already exists'}), 400
        
        # Hash password
        hashed_password = generate_password_hash(data['adminPassword'])
        
        # Create admin document
        admin_doc = {
            'adminName': data['adminName'],
            'adminPassword': hashed_password,
            'createdAt': datetime.utcnow()
        }
        
        # Insert admin
        result = admins_collection.insert_one(admin_doc)
        
        # Generate token
        token = generate_token(result.inserted_id)
        
        return jsonify({
            'message': 'Admin registered successfully',
            'token': token,
            'admin': {
                'id': str(result.inserted_id),
                'adminName': data['adminName']
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Admin Login
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json()
        
        # Find admin
        admin = admins_collection.find_one({'adminName': data['adminName']})
        
        if not admin or not check_password_hash(admin['adminPassword'], data['adminPassword']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate token
        token = generate_token(admin['_id'])
        
        return jsonify({
            'message': 'Admin login successful',
            'token': token,
            'admin': {
                'id': str(admin['_id']),
                'adminName': admin['adminName']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get All Users (Admin only)
@app.route('/api/admin/users', methods=['GET'])
def get_all_users():
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        admin_id = verify_token(token)
        
        if not admin_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Check if user is admin
        admin = admins_collection.find_one({'_id': ObjectId(admin_id)})
        if not admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get all users
        users = list(users_collection.find({}, {'password': 0}))
        
        for user in users:
            user['_id'] = str(user['_id'])
            user['createdAt'] = user['createdAt'].isoformat()
        
        return jsonify({'users': users}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get Admin Profile
@app.route('/api/admin/profile', methods=['GET'])
def get_admin_profile():
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        admin_id = verify_token(token)
        
        if not admin_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        admin = admins_collection.find_one({'_id': ObjectId(admin_id)})
        if not admin:
            return jsonify({'error': 'Admin not found'}), 404
        
        return jsonify({
            'admin': {
                'id': str(admin['_id']),
                'adminName': admin['adminName']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Delete User (Admin only)
@app.route('/api/admin/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        admin_id = verify_token(token)
        
        if not admin_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Check if user is admin
        admin = admins_collection.find_one({'_id': ObjectId(admin_id)})
        if not admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        # Delete user and all related data
        user_object_id = ObjectId(user_id)
        
        # Delete user
        users_collection.delete_one({'_id': user_object_id})
        
        # Delete user's income records
        income_collection.delete_many({'userId': user_object_id})
        
        # Delete user's expense records
        expense_collection.delete_many({'userId': user_object_id})
        
        return jsonify({'message': 'User deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
