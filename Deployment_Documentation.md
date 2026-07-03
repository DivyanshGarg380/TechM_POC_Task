# Dockerizing and Automating Deployment with Jenkins
*Employee Management System - Spring Boot POC*

## What this task was about

The goal was to take the Employee Management System backend (Spring Boot, Java 17, MySQL) that I'd already built as a POC, and set up a proper build-and-deploy pipeline for it using Docker and Jenkins, instead of running it manually every time.

## Docker setup

I installed Docker Desktop and wrote a Dockerfile for the Backend module. I used a two-stage build: the first stage uses a Maven + JDK 17 image to compile the project into a jar, and the second stage copies just that jar into a lightweight JRE-only image. This keeps the final image small since it doesn't carry Maven or the source code with it.

```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/employee-management-system-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Since the app also needs a MySQL database, I added a `docker-compose.yml` at the repo root that spins up both the app container and a MySQL container together, and points the app at the database using the service name (`mysql`) instead of `localhost`.

To build and run it locally:
```bash
docker compose up -d --build
```

I confirmed the app was reachable at `http://localhost:8080/swagger-ui.html` once both containers were up.

## Jenkins setup

Rather than installing Jenkins directly on my machine, I ran it as a container, which was simpler to set up and tear down:

```bash
docker run -d --name jenkins -p 9090:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -u root \
  jenkins/jenkins:lts
```

I mapped Jenkins to port 9090 on the host since 8080 is already used by the app itself. The Docker socket is mounted in so that Jenkins (which itself runs inside a container) can issue `docker build`/`run` commands against the host's Docker engine, without this, the pipeline can't build or start containers at all.

After the container was up, I grabbed the initial admin password, went through the setup wizard, installed the suggested plugins, and additionally installed the **Docker Pipeline** plugin, which is needed for the `docker` steps in the pipeline to work.

## The pipeline itself

The Jenkinsfile defines five stages that run one after another: checkout the latest code, build the project with Maven, build the Docker image, stop whatever container is currently running, and start a new one from the freshly built image.

```groovy
pipeline {
    agent any
    environment {
        IMAGE_NAME = "employee-management-system"
        CONTAINER_NAME = "employee-app"
        APP_PORT = "8080"
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: '<repo-url>'
            }
        }
        stage('Build with Maven') {
            steps {
                dir('Backend') {
                    sh 'mvn -B clean package -DskipTests'
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                dir('Backend') {
                    sh "docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} -t ${IMAGE_NAME}:latest ."
                }
            }
        }
        stage('Stop Old Container') {
            steps {
                sh "docker stop ${CONTAINER_NAME} || true; docker rm ${CONTAINER_NAME} || true"
            }
        }
        stage('Run New Container') {
            steps {
                sh "docker run -d --name ${CONTAINER_NAME} -p ${APP_PORT}:8080 ${IMAGE_NAME}:latest"
            }
        }
    }
}
```

In Jenkins, I created a new Pipeline job, set it to pull the pipeline script from SCM (my Git repo), pointed the script path at the Jenkinsfile, and triggered a build manually to test it end to end. Every push after this can be built the same way, either manually or by adding a webhook.

## Screenshots

Included separately / attached below:
- Jenkins dashboard with the pipeline job listed
- Successful pipeline run - all stages green
- `docker images` output showing the built image
- `docker ps` output showing the running container
- Application running in the browser (Swagger UI)

## Issues I ran into

Port conflict between Jenkins and the app - both default to 8080. Fixed by running Jenkins on host port 9090 instead.

Jenkins couldn't run docker commands at first, since it had no access to the Docker engine. Fixed by mounting `/var/run/docker.sock` into the Jenkins container and installing the Docker Pipeline plugin.

The app container couldn't connect to MySQL when both were run separately with plain `docker run`. Switched to docker-compose so they share a network and the app can reach the database by its service name.

Re-running the pipeline failed the second time because a container with the same name already existed. Added a stage that stops and removes the old container before starting the new one.