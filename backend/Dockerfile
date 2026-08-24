# =========================================================
# STAGE 1: BUILD MAVEN JAR
# =========================================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build production JAR
COPY src ./src
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
ENV SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/ResumeIQ?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
ENV SPRING_DATASOURCE_USERNAME=root
ENV SPRING_DATASOURCE_PASSWORD=A1@CHAITu143

# Launch Spring Boot Application
ENTRYPOINT ["java", "-jar", "app.jar"]
