#!/bin/bash
# Test script for Awaaz AI service and backend integration

echo "🧪 Awaaz Backend & AI Service Test Suite"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:5000"
AI_URL="http://localhost:8001/api/v1"
MONGO_URL="mongodb://localhost:27017"

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response)"
        ((FAILED++))
    fi
}

echo -e "${BLUE}1. Checking Services Status${NC}"
echo "================================"

# Check MongoDB
echo -n "MongoDB... "
if nc -z localhost 27017 2>/dev/null; then
    echo -e "${GREEN}✓ Running${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ Not running${NC}"
    ((FAILED++))
fi

# Check Backend
echo -n "Backend Server... "
if nc -z localhost 5000 2>/dev/null; then
    echo -e "${GREEN}✓ Running${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ Not running${NC}"
    ((FAILED++))
fi

# Check AI Service
echo -n "AI Service... "
if nc -z localhost 8001 2>/dev/null; then
    echo -e "${GREEN}✓ Running${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ Not running${NC}"
    ((FAILED++))
fi

# Check Frontend
echo -n "Frontend... "
if nc -z localhost 3000 2>/dev/null; then
    echo -e "${GREEN}✓ Running${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ Not running${NC}"
fi

echo ""
echo -e "${BLUE}2. Testing AI Service Endpoints${NC}"
echo "================================"

# Test AI health check
test_endpoint "AI Health Check" "GET" "$AI_URL/health"

# Test AI classification
test_endpoint "AI Classification" "POST" "$AI_URL/classify" \
    '{"text": "Broken pothole on Main Road"}'

# Test AI embeddings
test_endpoint "AI Embeddings" "POST" "$AI_URL/embeddings" \
    '{"text": "Water leaking from pipe"}'

# Test AI clustering
test_endpoint "AI Clustering" "POST" "$AI_URL/cluster" \
    '{"issues": [{"title": "Broken road", "description": "Pothole"}]}'

# Test AI prioritization
test_endpoint "AI Prioritization" "POST" "$AI_URL/prioritize" \
    '{"title": "Street light broken", "category": "Power"}'

echo ""
echo -e "${BLUE}3. Testing Backend Endpoints${NC}"
echo "================================"

# Test backend health
test_endpoint "Backend Health" "GET" "$BACKEND_URL/api/issues"

# Test analytics overview
test_endpoint "Analytics Overview" "GET" "$BACKEND_URL/api/analytics/overview"

# Test analytics duplicate analysis
test_endpoint "Duplicate Analysis" "GET" "$BACKEND_URL/api/analytics/duplicate-analysis"

# Test CSRF token
test_endpoint "CSRF Token" "GET" "$BACKEND_URL/api/csrf-token"

echo ""
echo -e "${BLUE}4. Performance Tests${NC}"
echo "================================"

# Test response time for classification
echo -n "Classification Response Time... "
start_time=$(date +%s%N)
curl -s -X POST "$AI_URL/classify" \
    -H "Content-Type: application/json" \
    -d '{"text": "Broken water pipe near hospital"}' > /dev/null
end_time=$(date +%s%N)
response_time=$((($end_time - $start_time) / 1000000))
if [ $response_time -lt 500 ]; then
    echo -e "${GREEN}✓ ${response_time}ms${NC} (Expected < 500ms)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ ${response_time}ms${NC} (Expected < 500ms)"
fi

echo ""
echo -e "${BLUE}5. Data Integration Tests${NC}"
echo "================================"

# Check if MongoDB has data
echo -n "MongoDB Connection... "
if command -v mongosh &> /dev/null; then
    result=$(mongosh --eval "db.adminCommand('ping')" --quiet 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Connected${NC}"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠ Unable to verify${NC}"
    fi
else
    echo -e "${YELLOW}⚠ mongosh not installed${NC}"
fi

echo ""
echo "========================================="
echo -e "${BLUE}Test Summary${NC}"
echo "========================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ All tests passed! System is ready.${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}✗ Some tests failed. Check the services above.${NC}"
    exit 1
fi
