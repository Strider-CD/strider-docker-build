# Strider Docker Build

Build Docker images with Strider. Uses the standard DOCKER_HOST environment variable. You can also use DOCKER_IP and DOCKER_PORT.

## Rationale

You may be producing docker images that are highly custom to your situation.

You may see no value in uploading these images to the official registry.

You may need your images to build quickly and cannot wait for the registry to process your automated build.

You may depend on this image for other projects tested in Strider via [strider-docker-runner](https://github.com/Strider-CD/strider-docker-runner)
