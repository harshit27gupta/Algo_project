import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function testGeminiAPI() {
  try {
    console.log('🔍 Testing Gemini API connection...');
    
    // Simple test prompt
    const prompt = "Hello how are you?";
    
    console.log('📤 Sending test prompt to Gemini...');
    
    // Generate content
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    console.log('✅ Gemini API Test Successful!');
    console.log('📥 Response:', response.text);
    console.log('\n🎉 Your Gemini API key is working correctly!');
    
  } catch (error) {
    console.error('❌ Gemini API Test Failed!');
    console.error('Error details:', error.message);
    
    if (error.message.includes('API_KEY')) {
      console.error('\n💡 Make sure your GEMINI_API_KEY is set in your .env file');
    } else if (error.message.includes('quota')) {
      console.error('\n💡 You may have exceeded your API quota');
    } else if (error.message.includes('network')) {
      console.error('\n💡 Check your internet connection');
    }
  }
}

// Run the test
testGeminiAPI();