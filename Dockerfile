# =========================================================
# STAGE 1: BUILD MAVEN JAR
# =========================================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy pom.xml and source code from backend directory
COPY backend/pom.xml .
COPY backend/src ./src

# Build production JAR
RUN mvn clean package -DskipTests

# =========================================================
# STAGE 2: PRODUCTION RUNTIME CONTAINER
# =========================================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create uploads directory for candidate resume storage
RUN mkdir -p /app/uploads

# Copy built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose backend port
EXPOSE 8080

# Environment Variable Defaults
ENV SERVER_PORT=8080

# Launch Spring Boot Application
ENTRYPOINT ["java", "-jar", "app.jar"]
