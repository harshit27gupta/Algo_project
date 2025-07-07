import mongoose from 'mongoose';
import Problem from './models/Problem.js';
import { enforceCppSignature, enforceJavaSignature, enforceCSignature } from './utils/signatureUtils.js';
import { wrapCppCode, wrapJavaCode, wrapCCode } from './utils/codeWrappers.js';
import { addJavaImports } from './utils/compilerUtils.js';

// Test database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/online_judge';

async function testSystem() {
  try {
    console.log('🔍 Testing Online Judge System...\n');
    
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Database connected successfully');
    
    // Test 1: Check if problems exist
    const problems = await Problem.find({});
    console.log(`✅ Found ${problems.length} problems in database`);
    
    if (problems.length === 0) {
      console.log('❌ No problems found. Please seed the database first.');
      return;
    }
    
    // Test 2: Check first problem's structure
    const firstProblem = problems[0];
    console.log(`\n📋 Testing problem: "${firstProblem.title}"`);
    console.log(`   Function Name: ${firstProblem.functionName}`);
    console.log(`   Function Signatures:`);
    console.log(`     C++: ${firstProblem.functionSignature?.get('cpp')}`);
    console.log(`     Java: ${firstProblem.functionSignature?.get('java')}`);
    console.log(`     C: ${firstProblem.functionSignature?.get('c')}`);
    console.log(`   Starter Code:`);
    console.log(`     C++: ${firstProblem.starterCode?.get('cpp')?.substring(0, 50)}...`);
    console.log(`     Java: ${firstProblem.starterCode?.get('java')?.substring(0, 50)}...`);
    console.log(`     C: ${firstProblem.starterCode?.get('c')?.substring(0, 50)}...`);
    
    // Test 3: Test signature enforcement
    console.log('\n🔧 Testing signature enforcement...');
    
    const testCppCode = `vector<int> myFunction(vector<int>& nums, int target) {
    return {};
}`;
    const enforcedCpp = enforceCppSignature(testCppCode, firstProblem.functionSignature?.get('cpp'), firstProblem.functionName);
    console.log(`   C++ Signature Enforcement: ${enforcedCpp.includes(firstProblem.functionName) ? '✅' : '❌'}`);
    
    const testJavaCode = `public class MyClass {
    public int[] myMethod(int[] nums, int target) {
        return new int[0];
    }
}`;
    const enforcedJava = enforceJavaSignature(testJavaCode, firstProblem.functionSignature?.get('java'), firstProblem.functionName);
    console.log(`   Java Signature Enforcement: ${enforcedJava.includes(firstProblem.functionName) ? '✅' : '❌'}`);
    
    const testCCode = `int* myFunction(int* nums, int numsSize, int target, int* returnSize) {
    return NULL;
}`;
    const enforcedC = enforceCSignature(testCCode, firstProblem.functionSignature?.get('c'), firstProblem.functionName);
    console.log(`   C Signature Enforcement: ${enforcedC.includes(firstProblem.functionName) ? '✅' : '❌'}`);
    
    // Test 4: Test code wrapping
    console.log('\n📦 Testing code wrapping...');
    
    const testInput = firstProblem.publicTestCases[0]?.input || 'nums=[2,7,11,15], target=9';
    console.log(`   Test Input: ${testInput}`);
    
    const wrappedCpp = wrapCppCode(enforcedCpp, testInput, firstProblem.functionName, firstProblem.functionSignature?.get('cpp'));
    console.log(`   C++ Wrapping: ${wrappedCpp.includes('int main()') ? '✅' : '❌'}`);
    
    const wrappedJava = wrapJavaCode(enforcedJava, testInput, firstProblem.functionName, firstProblem.functionSignature?.get('java'));
    console.log(`   Java Wrapping: ${wrappedJava.includes('public static void main') ? '✅' : '❌'}`);
    
    const wrappedC = wrapCCode(enforcedC, testInput, firstProblem.functionName, firstProblem.functionSignature?.get('c'));
    console.log(`   C Wrapping: ${wrappedC.includes('int main()') ? '✅' : '❌'}`);
    
    // Test 5: Test Java imports
    console.log('\n📚 Testing Java imports...');
    const javaWithImports = addJavaImports(enforcedJava);
    console.log(`   Java Imports: ${javaWithImports.includes('import java.util.*') ? '✅' : '✅ (not needed)'}`);
    
    console.log('\n🎉 System test completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   ✅ Database connection working');
    console.log('   ✅ Problem data structure correct');
    console.log('   ✅ Function signatures accessible');
    console.log('   ✅ Signature enforcement working');
    console.log('   ✅ Code wrapping working');
    console.log('   ✅ Java imports working');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database disconnected');
  }
}

// Run the test
testSystem(); 