# Git Security Verification Script (PowerShell)
# Run this before pushing to Git

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "🔒 Git Security Verification" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true

# Check if .env files are ignored
Write-Host "1. Checking if .env files are ignored..."
try {
    git check-ignore backend/.env 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ backend/.env is ignored" -ForegroundColor Green
    } else {
        Write-Host "❌ WARNING: backend/.env is NOT ignored!" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "⚠️  Could not check backend/.env" -ForegroundColor Yellow
}

try {
    git check-ignore ai-career-compass/.env 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ ai-career-compass/.env is ignored" -ForegroundColor Green
    } else {
        Write-Host "❌ WARNING: ai-career-compass/.env is NOT ignored!" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "⚠️  Could not check ai-career-compass/.env" -ForegroundColor Yellow
}

Write-Host ""

# Check if database is ignored
Write-Host "2. Checking if database is ignored..."
try {
    git check-ignore backend/db.sqlite3 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ db.sqlite3 is ignored" -ForegroundColor Green
    } else {
        Write-Host "⚠️  db.sqlite3 might not be ignored (check if it exists)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not check db.sqlite3" -ForegroundColor Yellow
}

Write-Host ""

# Check for API keys in staged files
Write-Host "3. Checking for API keys in staged files..."
$stagedDiff = git diff --cached 2>&1

if ($stagedDiff -match "AIzaSy") {
    Write-Host "❌ DANGER: Gemini API key found in staged files!" -ForegroundColor Red
    $allPassed = $false
} else {
    Write-Host "✅ No Gemini API keys in staged files" -ForegroundColor Green
}

if ($stagedDiff -match "sk-ant-") {
    Write-Host "❌ DANGER: Anthropic API key found in staged files!" -ForegroundColor Red
    $allPassed = $false
} else {
    Write-Host "✅ No Anthropic API keys in staged files" -ForegroundColor Green
}

Write-Host ""

# Check git status for sensitive files
Write-Host "4. Checking git status for sensitive files..."
$gitStatus = git status 2>&1

if ($gitStatus -match "\.env$|db\.sqlite3|node_modules") {
    Write-Host "❌ WARNING: Sensitive files detected in git status!" -ForegroundColor Red
    Write-Host "Files detected:" -ForegroundColor Yellow
    $gitStatus | Select-String -Pattern "\.env$|db\.sqlite3|node_modules"
    $allPassed = $false
} else {
    Write-Host "✅ No sensitive files in git status" -ForegroundColor Green
}

Write-Host ""

# Check if .env.example files exist
Write-Host "5. Checking if .env.example files exist..."
if (Test-Path "backend/.env.example") {
    Write-Host "✅ backend/.env.example exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  backend/.env.example not found" -ForegroundColor Yellow
}

if (Test-Path "ai-career-compass/.env.example") {
    Write-Host "✅ ai-career-compass/.env.example exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  ai-career-compass/.env.example not found" -ForegroundColor Yellow
}

Write-Host ""

# Check if .env.example contains real keys
Write-Host "6. Checking if .env.example files contain real keys..."
if (Test-Path "backend/.env.example") {
    $backendExample = Get-Content "backend/.env.example" -Raw
    if ($backendExample -match "AIzaSy[A-Za-z0-9_-]{33}") {
        Write-Host "❌ DANGER: Real API key in backend/.env.example!" -ForegroundColor Red
        $allPassed = $false
    } else {
        Write-Host "✅ backend/.env.example is safe" -ForegroundColor Green
    }
}

if (Test-Path "ai-career-compass/.env.example") {
    $frontendExample = Get-Content "ai-career-compass/.env.example" -Raw
    if ($frontendExample -match "AIzaSy[A-Za-z0-9_-]{33}") {
        Write-Host "❌ DANGER: Real API key in ai-career-compass/.env.example!" -ForegroundColor Red
        $allPassed = $false
    } else {
        Write-Host "✅ ai-career-compass/.env.example is safe" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "📋 Summary" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

if ($allPassed) {
    Write-Host "✅ All checks passed! You're safe to push!" -ForegroundColor Green
} else {
    Write-Host "❌ Some checks failed! Fix them before pushing." -ForegroundColor Red
}

Write-Host ""
Write-Host "To push to Git:" -ForegroundColor Cyan
Write-Host "  git add ." -ForegroundColor White
Write-Host "  git commit -m 'Your message'" -ForegroundColor White
Write-Host "  git push" -ForegroundColor White
Write-Host ""
