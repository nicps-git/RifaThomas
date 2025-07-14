#!/bin/bash
echo "=== BUILD SCRIPT INICIADO ==="
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Ubuntu version: $(lsb_release -a 2>/dev/null || cat /etc/os-release)"
echo "Build directory: $(pwd)"
echo "Files in netlify-deploy:"
ls -la netlify-deploy/
echo "=== BUILD CONCLUÍDO ==="
