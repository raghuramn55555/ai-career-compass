#!/bin/bash

# Git Security Verification Script
# Run this before pushing to Git

echo "=================================="
echo "🔒 Git Security Verification"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env files are ignored
echo "1. Checking if .env files are ignored..."
if git check-ignore backend/.env > /dev/null 2>&1; then
    echo -e "${GREEN}✅ backend/.env is ignored${NC}"
else
    echo -e "${RED}❌ WARNING: backend/.env is NOT ignored!${NC}"
fi

if git check-ignore ai-career-compass/.env > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ai-career-compass/.env is ignored${NC}"
else
    echo -e "${RED}❌ WARNING: ai-career-compass/.env is NOT ignored!${NC}"
fi

echo ""

# Check if database is ignored
echo "2. Checking if database is ignored..."
if git check-ignore backend/db.sqlite3 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ db.sqlite3 is ignored${NC}"
else
    echo -e "${YELLOW}⚠️  db.sqlite3 might not be ignored (check if it exists)${NC}"
fi

echo ""

# Check for API keys in staged files
echo "3. Checking for API keys in staged files..."
if git diff --cached | grep -i "AIzaSy" > /dev/null 2>&1; then
    echo -e "${RED}❌ DANGER: Gemini API key found in staged files!${NC}"
else
    echo -e "${GREEN}✅ No Gemini API keys in staged files${NC}"
fi

if git diff --cached | grep -i "sk-ant-" > /dev/null 2>&1; then
    echo -e "${RED}❌ DANGER: Anthropic API key found in staged files!${NC}"
else
    echo -e "${GREEN}✅ No Anthropic API keys in staged files${NC}"
fi

echo ""

# Check git status for sensitive files
echo "4. Checking git status for sensitive files..."
if git status | grep -E "\.env$|db\.sqlite3|node_modules" > /dev/null 2>&1; then
    echo -e "${RED}❌ WARNING: Sensitive files detected in git status!${NC}"
    echo "Files detected:"
    git status | grep -E "\.env$|db\.sqlite3|node_modules"
else
    echo -e "${GREEN}✅ No sensitive files in git status${NC}"
fi

echo ""

# Check if .env.example files exist
echo "5. Checking if .env.example files exist..."
if [ -f "backend/.env.example" ]; then
    echo -e "${GREEN}✅ backend/.env.example exists${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.env.example not found${NC}"
fi

if [ -f "ai-career-compass/.env.example" ]; then
    echo -e "${GREEN}✅ ai-career-compass/.env.example exists${NC}"
else
    echo -e "${YELLOW}⚠️  ai-career-compass/.env.example not found${NC}"
fi

echo ""

# Check if .env.example contains real keys
echo "6. Checking if .env.example files contain real keys..."
if grep -q "AIzaSy" backend/.env.example 2>/dev/null; then
    echo -e "${RED}❌ DANGER: Real API key in backend/.env.example!${NC}"
else
    echo -e "${GREEN}✅ backend/.env.example is safe${NC}"
fi

if grep -q "AIzaSy" ai-career-compass/.env.example 2>/dev/null; then
    echo -e "${RED}❌ DANGER: Real API key in ai-career-compass/.env.example!${NC}"
else
    echo -e "${GREEN}✅ ai-career-compass/.env.example is safe${NC}"
fi

echo ""
echo "=================================="
echo "📋 Summary"
echo "=================================="
echo ""
echo "If all checks passed (✅), you're safe to push!"
echo "If any checks failed (❌), fix them before pushing."
echo ""
echo "To push to Git:"
echo "  git add ."
echo "  git commit -m 'Your message'"
echo "  git push"
echo ""
