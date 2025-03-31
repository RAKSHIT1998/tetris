#!/bin/bash

# Initialize Capacitor platforms
npx cap init "Modern Tetris" "com.modern.tetris"

# Add platforms
npx cap add android
npx cap add ios

# Copy web assets
npx cap sync

echo "Build completed! To open in native IDEs:"
echo "For Android: npx cap open android"
echo "For iOS: npx cap open ios"