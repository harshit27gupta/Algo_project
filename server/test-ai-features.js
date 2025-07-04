import { generateHint } from './utils/geminiHints.js';
import { generateChatbotResponse, generateProgrammingHelp } from './utils/geminiChatbot.js';

async function testAIFeatures() {
  console.log('🤖 Testing AI Features...\n');

  // Test 1: Hint Generation
  console.log('📝 Testing Hint Generation...');
  try {
    const problemData = {
      title: "Two Sum",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      constraints: ["2 <= nums.length <= 104", "-109 <= nums[i] <= 109", "-109 <= target <= 109"],
      examples: [
        { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
        { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
      ]
    };

    const userCode = `
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // TODO: Implement solution
    return NULL;
}
`;

    const hint = await generateHint(problemData, userCode, 1);
    console.log('✅ Hint 1 generated successfully!');
    console.log('💡 Hint:', hint);
    console.log('');

  } catch (error) {
    console.error('❌ Hint generation failed:', error.message);
  }

  // Test 2: Chatbot Response
  console.log('💬 Testing Chatbot Response...');
  try {
    const response = await generateChatbotResponse("How do I submit my code?");
    console.log('✅ Chatbot response generated successfully!');
    console.log('🤖 Response:', response);
    console.log('');

  } catch (error) {
    console.error('❌ Chatbot response failed:', error.message);
  }

  // Test 3: Programming Help
  console.log('🔧 Testing Programming Help...');
  try {
    const helpResponse = await generateProgrammingHelp(
      "What's wrong with my code?",
      "C++",
      `
#include <iostream>
using namespace std;

int main() {
    int x = 5;
    cout << x;
    return 0;
}
`
    );
    console.log('✅ Programming help generated successfully!');
    console.log('🔧 Help:', helpResponse);
    console.log('');

  } catch (error) {
    console.error('❌ Programming help failed:', error.message);
  }

  console.log('🎉 AI Features Test Complete!');
}

// Run the test
testAIFeatures(); 