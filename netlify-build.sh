#!/bin/bash

# Simple static site validation for Netlify
echo "Building static site..."

# Check if netlify-deploy directory exists
if [ ! -d "netlify-deploy" ]; then
    echo "Error: netlify-deploy directory not found"
    exit 1
fi

# Check essential files
if [ ! -f "netlify-deploy/index.html" ]; then
    echo "Error: index.html not found"
    exit 1
fi

if [ ! -f "netlify-deploy/script.js" ]; then
    echo "Error: script.js not found" 
    exit 1
fi

if [ ! -f "netlify-deploy/firebase-config.js" ]; then
    echo "Error: firebase-config.js not found"
    exit 1
fi

echo "Static site ready for deployment"
echo "Files: $(ls netlify-deploy/ | wc -l)"
