#!/bin/bash

# DEPRECATED: Bash health check script has been removed in favor of PowerShell on Windows.
# Please use the PowerShell script instead:
#   health-check.ps1
# If you are on Linux/Mac, manually verify endpoints as per DEPLOYMENT.md.

echo "[DEPRECATED] health-check.sh has been removed. Use health-check.ps1 instead." >&2
exit 1
        echo -e "${GREEN}✓ OK${NC} (HTTP $response)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $response, expected $expected)"
        ((FAILED++))
        return 1
    fi
}

# Function to check JSON response
check_json() {
    local name=$1
    local url=$2
    local key=$3
    local expected=$4
    
    echo -n "Checking $name... "
    
    response=$(curl -s "$url" 2>/dev/null)
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ FAILED${NC} (Connection failed)"
        ((FAILED++))
        return 1
    fi
    
    value=$(echo "$response" | grep -o "\"$key\":\"[^\"]*\"" | cut -d'"' -f4)
    
    if [ "$value" = "$expected" ]; then
        echo -e "${GREEN}✓ OK${NC} ($key: $value)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} ($key: $value, expected $expected)"
        ((FAILED++))
        return 1
    fi
}

echo "1. Frontend (Next.js)"
echo "---------------------"
check_service "Homepage" "http://localhost:5000" "200"
check_service "API Health" "http://localhost:5000/api/health" "200"
echo ""

echo "2. AI Agent (Spark)"
echo "-------------------"
check_json "Health Check" "http://localhost:8000/health" "status" "healthy"
check_json "Service Info" "http://localhost:8000/" "service" "Spark AI Agent"
check_service "API Docs" "http://localhost:8000/docs" "200"
echo ""

echo "3. Database"
echo "-----------"
echo -n "Checking Prisma connection... "
if npx prisma db pull --force > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi
echo ""

echo "4. Environment Variables"
echo "------------------------"

check_env() {
    local name=$1
    local file=$2
    
    echo -n "Checking $name... "
    
    if [ -f "$file" ]; then
        if grep -q "OPENAI_API_KEY=\"sk-" "$file" 2>/dev/null; then
            echo -e "${GREEN}✓ OK${NC}"
            ((PASSED++))
        else
            echo -e "${YELLOW}⚠ WARNING${NC} (OpenAI API key not set)"
            ((FAILED++))
        fi
    else
        echo -e "${RED}✗ FAILED${NC} (File not found)"
        ((FAILED++))
    fi
}

check_env ".env.local" ".env.local"
check_env "spark-ai-agent/.env" "spark-ai-agent/.env"
echo ""

echo "=================================="
echo "Summary"
echo "=================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All checks passed! ✓${NC}"
    echo "Your Entropy platform is ready to use!"
    exit 0
else
    echo -e "${RED}Some checks failed! ✗${NC}"
    echo "Please review the errors above and fix them."
    exit 1
fi
