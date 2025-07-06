from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Your Groq API key
API_KEY = os.getenv('API_KEY')

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        # Get the JSON data from the request
        data = request.get_json()
        
        if not data or 'messages' not in data:
            return jsonify({'error': 'No messages provided'}), 400
        
        # Extract messages from the request
        messages = data['messages']
        
        # Prepare payload for Groq API
        payload = {
            "messages": messages,
            "model": "llama3-8b-8192",
            "max_tokens": 150,
            "temperature": 0.7
        }
        
        # Make request to Groq API
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload
        )
        
        if response.status_code == 200:
            result = response.json()
            return jsonify(result)
        else:
            return jsonify({
                'error': f'Groq API error: {response.status_code}',
                'details': response.text
            }), response.status_code
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Backend is running!'})

if __name__ == '__main__':
    print("🚀 Flask server starting...")
    print("🔗 API endpoints:")
    print("   - POST /api/chat - Chat with the bot")
    print("   - GET /api/health - Health check")
    print("📱 Frontend should connect to: http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)