#!/usr/bin/env bash
set -e

# =========================================================
# FIND JAVA BINARY (PORTABLE JDK 21 OR SYSTEM JAVA)
# =========================================================
JAVA_BIN=""

if [ -f "$HOME/.m2/jdk-21/bin/java" ]; then
  JAVA_BIN="$HOME/.m2/jdk-21/bin/java"
elif [ -d "$HOME/.m2/jdk-21" ]; then
  JAVA_BIN=$(find "$HOME/.m2/jdk-21" -name "java" -type f | head -n 1)
elif command -v java >/dev/null 2>&1; then
  JAVA_BIN="java"
fi

if [ -z "$JAVA_BIN" ]; then
  echo "==> Error: Could not find Java executable for startup."
  exit 1
fi

echo "==> Using Java binary: $JAVA_BIN"

# =========================================================
# FIND BUILT SPRING BOOT JAR
# =========================================================
JAR_FILE=""

if [ -f "target/resumeiq-backend-0.0.1-SNAPSHOT.jar" ]; then
  JAR_FILE="target/resumeiq-backend-0.0.1-SNAPSHOT.jar"
elif [ -f "../backend/target/resumeiq-backend-0.0.1-SNAPSHOT.jar" ]; then
  JAR_FILE="../backend/target/resumeiq-backend-0.0.1-SNAPSHOT.jar"
else
  JAR_FILE=$(find . -name "*.jar" | grep -v "sources" | head -n 1)
fi

if [ -z "$JAR_FILE" ]; then
  echo "==> Error: Could not find built Spring Boot JAR file."
  exit 1
fi

echo "==> Launching Spring Boot backend: $JAR_FILE"
exec "$JAVA_BIN" -jar "$JAR_FILE"
