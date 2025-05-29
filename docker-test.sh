#!/bin/bash
set -e

echo "Moodle MCP Docker Test Script"
echo "============================="

if [[ -z "$MOODLE_SITE_URL" || -z "$MOODLE_WS_TOKEN" ]]; then
    echo "Error: MOODLE_SITE_URL and MOODLE_WS_TOKEN must be set"
    echo "Example:"
    echo "export MOODLE_SITE_URL=https://your-moodle-site.com"
    echo "export MOODLE_WS_TOKEN=your-webservice-token"
    exit 1
fi

echo "Environment variables check: OK"
echo "MOODLE_SITE_URL: $MOODLE_SITE_URL"
echo "MOODLE_WS_TOKEN: [HIDDEN]"
echo ""

echo "Building Docker image..."
docker build -t shinonomelaboratory/moodle-mcp:test .

echo "Docker image built successfully!"
echo ""

echo "Running Docker container test..."
echo "Container will start and then exit after a few seconds..."
echo ""

timeout 30s docker run --rm \
  -e MOODLE_SITE_URL="$MOODLE_SITE_URL" \
  -e MOODLE_WS_TOKEN="$MOODLE_WS_TOKEN" \
  shinonomelaboratory/moodle-mcp:test &

CONTAINER_PID=$!

sleep 5

if kill -0 $CONTAINER_PID 2>/dev/null; then
    echo "✅ Docker container is running successfully!"
    echo "Stopping test container..."
    kill $CONTAINER_PID
else
    echo "❌ Docker container failed to start or exited early"
    exit 1
fi

echo ""
echo "🎉 Docker test completed successfully!"
echo ""
echo "To run manually:"
echo "docker run -it --rm \\"
echo "  -e MOODLE_SITE_URL=\"$MOODLE_SITE_URL\" \\"
echo "  -e MOODLE_WS_TOKEN=\"$MOODLE_WS_TOKEN\" \\"
echo "  shinonomelaboratory/moodle-mcp:test" 