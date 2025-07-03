# Artillery Load Testing Script for Online Judge System
# Run this script to test different endpoints with Artillery

Write-Host "🚀 Artillery Load Testing for Online Judge System" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Check if Artillery is installed
try {
    $artilleryVersion = artillery --version 2>$null
    Write-Host "✅ Artillery found: $artilleryVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Artillery not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g artillery" -ForegroundColor Yellow
    exit 1
}

# Check if services are running
Write-Host "Checking if services are running..." -ForegroundColor Yellow

try {
    $serverResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/v1/problems" -Method GET -TimeoutSec 5
    Write-Host "Server is running on port 5000" -ForegroundColor Green
} catch {
    Write-Host "Server is not running on port 5000" -ForegroundColor Red
    exit 1
}

try {
    $compilerResponse = Invoke-WebRequest -Uri "http://localhost:8000" -Method GET -TimeoutSec 5
    Write-Host "Compiler service is running on port 8000" -ForegroundColor Green
} catch {
    Write-Host "Compiler service is not running on port 8000" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Available Tests:" -ForegroundColor Cyan
Write-Host "1. Auth Load Test (150 users)" -ForegroundColor White
Write-Host "2. Problems Load Test (100 users)" -ForegroundColor White
Write-Host "3. Compiler Light Test (20 users)" -ForegroundColor White
Write-Host "4. Compiler Load Test (100 users)" -ForegroundColor White
Write-Host "5. All Tests (Sequential)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host "🧪 Running Auth Load Test..." -ForegroundColor Yellow
        artillery run artillery-auth-test.yml
    }
    "2" {
        Write-Host "🧪 Running Problems Load Test..." -ForegroundColor Yellow
        artillery run artillery-problems-test.yml
    }
    "3" {
        Write-Host "🧪 Running Compiler Light Test..." -ForegroundColor Yellow
        artillery run artillery-compiler-light.yml
    }
    "4" {
        Write-Host "🧪 Running Compiler Load Test..." -ForegroundColor Yellow
        artillery run artillery-compiler-test.yml
    }
    "5" {
        Write-Host "🧪 Running All Tests Sequentially..." -ForegroundColor Yellow
        Write-Host "Starting with Auth Test..." -ForegroundColor Cyan
        artillery run artillery-auth-test.yml
        Write-Host "Starting Problems Test..." -ForegroundColor Cyan
        artillery run artillery-problems-test.yml
        Write-Host "Starting Compiler Light Test..." -ForegroundColor Cyan
        artillery run artillery-compiler-light.yml
        Write-Host "Starting Compiler Load Test..." -ForegroundColor Cyan
        artillery run artillery-compiler-test.yml
    }
    default {
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Artillery testing completed!" -ForegroundColor Green
Write-Host "Check the output above for detailed results." -ForegroundColor Cyan 