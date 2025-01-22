#!/bin/bash
npm run clean
npm run build

# Create zip for distribution (optional)
cd dist
zip ../cerebruh-mcp.zip *
cd ..