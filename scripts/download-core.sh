#!/usr/bin/env bash
# Downloads the WebAuditCore JAR for the version supplied as $1 (or read from
# /tmp/WEBAUDIT_CORE_VERSION if no argument is provided) and installs it into
# the local Maven repo so the surrounding service build can resolve it.
#
# This script is intentionally the single source of truth for how services
# fetch WebAuditCore. Each service Dockerfile copies it from the repo root.
set -euo pipefail

VERSION="${1:-}"
if [ -z "${VERSION}" ] && [ -f /tmp/WEBAUDIT_CORE_VERSION ]; then
  VERSION="$(cat /tmp/WEBAUDIT_CORE_VERSION)"
elif [ -z "${VERSION}" ] && [ -f /tmp/WEBAUDIT_CORE_VERSION ]; then
  VERSION="$(cat /tmp/WEBAUDIT_CORE_VERSION)"
fi
if [ -z "${VERSION}" ]; then
  echo "usage: download-core.sh <version>" >&2
  exit 1
fi

REPO="${WEBAUDIT_CORE_REPO:-${WebAudit_CORE_REPO:-deepthought42/WebAuditCore}}"
JAR_URL="https://github.com/${REPO}/releases/download/v${VERSION}/webaudit-core-${VERSION}.jar"
DEST_DIR="${WEBAUDIT_CORE_LIB_DIR:-${WebAudit_CORE_LIB_DIR:-libs}}"
DEST_JAR="${DEST_DIR}/core-${VERSION}.jar"

mkdir -p "${DEST_DIR}"

echo "Downloading WebAudit Core ${VERSION} from ${JAR_URL}"
curl -fsSL "${JAR_URL}" -o "${DEST_JAR}"

mvn -q install:install-file \
  -Dfile="${DEST_JAR}" \
  -DgroupId=com.webaudit \
  -DartifactId=core \
  -Dversion="${VERSION}" \
  -Dpackaging=jar

echo "Installed com.webaudit:core:${VERSION}"
