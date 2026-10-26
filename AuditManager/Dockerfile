# syntax=docker/dockerfile:1.6
# WebAuditCore version is supplied at build time via --build-arg from the
# repo-root WEBAUDIT_CORE_VERSION file. See scripts/download-core.sh.
FROM maven:3.9.6-eclipse-temurin-17 AS build

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

FROM eclipse-temurin:17-jre
COPY --from=build /app/target/*.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-ea","-jar","/app/app.jar"]
