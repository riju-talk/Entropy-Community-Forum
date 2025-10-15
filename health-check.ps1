# Health Check Script for Entropy Platform (PowerShell)
# Tests all services and reports status

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Entropy Platform Health Check" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$PASSED = 0
$FAILED = 0

function Check-Service {
    param(
        [string]$Name,
        [string]$Url,
        [int]$Expected
    )
    
    Write-Host "Checking $Name... " -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
        $statusCode = $response.StatusCode
        
        if ($statusCode -eq $Expected) {
            Write-Host "✓ OK" -ForegroundColor Green -NoNewline
            Write-Host " (HTTP $statusCode)"
            $script:PASSED++
            return $true
        } else {
            Write-Host "✗ FAILED" -ForegroundColor Red -NoNewline
            Write-Host " (HTTP $statusCode, expected $Expected)"
            $script:FAILED++
            return $false
        }
    } catch {
        Write-Host "✗ FAILED" -ForegroundColor Red -NoNewline
        Write-Host " (Connection failed)"
        $script:FAILED++
        return $false
    }
}

function Check-Json {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Key,
        [string]$Expected
    )
    
    Write-Host "Checking $Name... " -NoNewline
    
    try {
        $response = Invoke-RestMethod -Uri $Url -TimeoutSec 5
        $value = $response.$Key
        
        if ($value -eq $Expected) {
            Write-Host "✓ OK" -ForegroundColor Green -NoNewline
            Write-Host " ($Key: $value)"
            $script:PASSED++
            return $true
        } else {
            Write-Host "✗ FAILED" -ForegroundColor Red -NoNewline
            Write-Host " ($Key: $value, expected $Expected)"
            $script:FAILED++
            return $false
        }
    } catch {
        Write-Host "✗ FAILED" -ForegroundColor Red -NoNewline
        Write-Host " (Connection failed)"
        $script:FAILED++
        return $false
    }
}

Write-Host "1. Frontend (Next.js)" -ForegroundColor Yellow
Write-Host "---------------------"
Check-Service "Homepage" "http://localhost:5000" 200
Check-Service "API Health" "http://localhost:5000/api/health" 200
Write-Host ""

Write-Host "2. AI Agent (Spark)" -ForegroundColor Yellow
Write-Host "-------------------"
Check-Json "Health Check" "http://localhost:8000/health" "status" "healthy"
Check-Json "Service Info" "http://localhost:8000/" "service" "Spark AI Agent"
Check-Service "API Docs" "http://localhost:8000/docs" 200
Write-Host ""

Write-Host "3. Database" -ForegroundColor Yellow
Write-Host "-----------"
Write-Host "Checking Prisma connection... " -NoNewline
try {
    $null = npx prisma db pull --force 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ OK" -ForegroundColor Green
        $PASSED++
    } else {
        Write-Host "✗ FAILED" -ForegroundColor Red
        $FAILED++
    }
} catch {
    Write-Host "✗ FAILED" -ForegroundColor Red
    $FAILED++
}
Write-Host ""

Write-Host "4. Environment Variables" -ForegroundColor Yellow
Write-Host "------------------------"

function Check-Env {
    param(
        [string]$Name,
        [string]$File
    )
    
    Write-Host "Checking $Name... " -NoNewline
    
    if (Test-Path $File) {
        $content = Get-Content $File -Raw
        if ($content -match 'OPENAI_API_KEY="sk-') {
            Write-Host "✓ OK" -ForegroundColor Green
            $script:PASSED++
        } else {
            Write-Host "⚠ WARNING" -ForegroundColor Yellow -NoNewline
            Write-Host " (OpenAI API key not set)"
            $script:FAILED++
        }
    } else {
        Write-Host "✗ FAILED" -ForegroundColor Red -NoNewline
        Write-Host " (File not found)"
        $script:FAILED++
    }
}

Check-Env ".env.local" ".env.local"
Check-Env "spark-ai-agent/.env" "spark-ai-agent\.env"
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Passed: " -NoNewline
Write-Host $PASSED -ForegroundColor Green
Write-Host "Failed: " -NoNewline
Write-Host $FAILED -ForegroundColor Red
Write-Host ""

if ($FAILED -eq 0) {
    Write-Host "All checks passed! ✓" -ForegroundColor Green
    Write-Host "Your Entropy platform is ready to use!"
    exit 0
} else {
    Write-Host "Some checks failed! ✗" -ForegroundColor Red
    Write-Host "Please review the errors above and fix them."
    exit 1
}
