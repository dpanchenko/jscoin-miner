#!/bin/bash
echo "Build image ${BUILD_REPO}"
echo "Config:"
echo "  - BUILD_TAG ${BUILD_TAG}"

docker login -u $DOCKER_USER -p $DOCKER_PASS
docker build -t ${BUILD_REPO} \
  --no-cache .

docker tag ${BUILD_REPO} dpanchenko/${BUILD_REPO}:${BUILD_TAG}
docker push dpanchenko/${BUILD_REPO}:${BUILD_TAG}

docker tag ${BUILD_REPO} dpanchenko/${BUILD_REPO}:latest
docker push dpanchenko/${BUILD_REPO}:latest
