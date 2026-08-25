#!/usr/bin/env bash
set -e

echo "==> ResumeIQ Backend Render Build Script"
chmod +x ./mvn
./mvn clean package -DskipTests
echo "==> Build Completed Successfully!"
