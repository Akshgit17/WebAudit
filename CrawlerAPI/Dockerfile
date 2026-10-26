# syntax=docker/dockerfile:1.6
# CrawlerAPI runs on Java 21 because it is the only service already on
# Spring Boot 3.x. Once Wave 4 of the architecture plan migrates the rest
# of the platform to SB 3, the base image can be unified to 17.
FROM maven:3.9.6-eclipse-temurin-21 AS build

ARG WEBAUDIT_CORE_VERSION
RUN test -n "${WEBAUDIT_CORE_VERSION}" || (echo "WEBAUDIT_CORE_VERSION build-arg is required" >&2; exit 1)

WORKDIR /app
COPY pom.xml .

RUN curl -fsSL "https://github.com/deepthought42/WebAuditCore/releases/download/v${WEBAUDIT_CORE_VERSION}/WEBAUDIT-core-${WEBAUDIT_CORE_VERSION}.jar" \
        -o "/tmp/core-${WEBAUDIT_CORE_VERSION}.jar" \
 && mvn -q install:install-file \
        -Dfile="/tmp/core-${WEBAUDIT_CORE_VERSION}.jar" \
        -DgroupId=com.webaudit \
        -DartifactId=core \
        -Dversion="${WEBAUDIT_CORE_VERSION}" \
        -Dpackaging=jar

COPY src ./src
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:21-jre
COPY --from=build /app/target/*.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-Xms800M","-jar","/app/app.jar"]
