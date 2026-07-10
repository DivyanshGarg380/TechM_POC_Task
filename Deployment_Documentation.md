# Dockerizing and Automating Deployment with Jenkins
*Employee Management System – Spring Boot POC*

## Objective

The objective of this task was to containerize an existing Employee Management System built using Spring Boot, Java 17, and MySQL, and automate its deployment using Jenkins. Instead of manually building and deploying the application after every code change, the goal was to create a CI/CD pipeline that automatically checks out the latest source code from GitHub, builds the application inside Docker, deploys it using Docker Compose, and verifies that all required containers are running successfully.

---

# Docker Setup

Docker Desktop was installed and used to containerize the backend application.

A multi-stage Dockerfile was created for the Spring Boot backend. The first stage uses a Maven + JDK 17 image to compile the application and generate the executable JAR. The second stage copies only the generated JAR into a lightweight JRE image, reducing the final image size by excluding Maven and the project source code.

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

Since the application depends on MySQL, a `docker-compose.yml` file was added at the project root to orchestrate both services. Docker Compose creates a shared network for the containers, allowing the Spring Boot application to connect to MySQL using the service name (`mysql`) instead of `localhost`.

To build and deploy the application locally:

```bash
docker-compose up -d --build
```

The backend was verified by opening Swagger UI:

```
http://localhost:8080/swagger-ui/index.html  
```

---

# Jenkins Setup

Instead of installing Jenkins directly on the host machine, Jenkins was deployed as a Docker container.

Initially, the official Jenkins LTS image was used. However, because the CI/CD pipeline needed to execute Docker and Docker Compose commands, a custom Jenkins image was created by extending the official image and installing both Docker CLI and Docker Compose.

```dockerfile
FROM jenkins/jenkins:lts

USER root

RUN apt-get update && \
    apt-get install -y docker.io docker-compose && \
    apt-get clean

USER jenkins
```

The custom Jenkins image was then started using:

```bash
docker run -d --name jenkins \
  -p 9090:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -u root \
  jenkins-docker
```

Port **9090** was mapped to Jenkins because port **8080** was already being used by the Spring Boot application.

The Docker socket was mounted into the Jenkins container so Jenkins could communicate directly with the host Docker daemon and execute Docker and Docker Compose commands during pipeline execution.

After launching Jenkins:

- Retrieved the initial administrator password.
- Installed the suggested plugins.
- Installed the **Docker Pipeline** plugin.
- Created a Pipeline project.
- Configured Jenkins to use the `Jenkinsfile` stored in the GitHub repository.

---

# Jenkins Pipeline

The application already uses a multi-stage Dockerfile, so Maven compilation is handled inside Docker itself. This eliminates the need to install Maven separately inside the Jenkins container.

The Jenkins pipeline performs three stages:

1. Checkout the latest source code from GitHub.
2. Build and deploy the application using Docker Compose.
3. Verify that all required containers are running successfully.

```groovy
pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = "employee_management_hub"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/DivyanshGarg380/TechM_POC_Task.git'
            }
        }

        stage('Build & Deploy') {
            steps {
                sh 'docker-compose down || true'
                sh 'docker-compose up -d --build'
            }
        }

        stage('Verify Running Containers') {
            steps {
                sh 'docker ps'
            }
        }
    }

    post {
        success {
            echo 'Application deployed successfully!'
            echo 'Swagger UI: http://localhost:8080/swagger-ui/index.html'
        }

        failure {
            echo 'Pipeline failed. Check the console output.'
        }
    }
}
```

Whenever a build is triggered, Jenkins:

- Clones the latest version of the repository.
- Builds the Docker image using the application's multi-stage Dockerfile.
- Starts both the Spring Boot and MySQL containers using Docker Compose.
- Verifies that the required containers are running successfully.

---

# Screenshots

The following screenshots are included with this report:

![alt text](<assets/Screenshot 2026-07-03 191316.png>) 
![alt text](<assets/Screenshot 2026-07-03 191148.png>) 
![alt text](<assets/Screenshot 2026-07-03 191227.png>) 
![alt text](<assets/Screenshot 2026-07-03 191237.png>) 
![alt text](<assets/Screenshot 2026-07-03 191254.png>)

---

# Challenges Faced

### 1. Port Conflict

Both Jenkins and the Spring Boot application use port **8080** by default.

**Solution:** Jenkins was mapped to host port **9090**.

---

### 2. Jenkins Could Not Execute Docker Commands

The default Jenkins container did not have Docker installed.

**Solution:** Created a custom Jenkins image with Docker CLI installed and mounted the Docker socket (`/var/run/docker.sock`) into the container.

---

### 3. Docker Compose Not Available

Although Docker CLI was available, Docker Compose commands initially failed.

**Solution:** Updated the custom Jenkins image to install Docker Compose and rebuilt the image before recreating the Jenkins container.

---

### 4. Maven Not Found

The original Jenkins pipeline attempted to execute Maven directly inside the Jenkins container, resulting in a `mvn: not found` error.

**Solution:** Removed the standalone Maven build stage and relied on the application's multi-stage Dockerfile, where Maven compilation is performed automatically during the Docker image build.

---

# Outcome

The Employee Management System was successfully containerized and deployed through Jenkins using Docker and Docker Compose.

The completed CI/CD pipeline is capable of:

- Automatically cloning the latest code from GitHub.
- Building the application inside Docker.
- Deploying the complete application stack using Docker Compose.
- Verifying successful deployment through Jenkins.
- Serving the backend application through Swagger UI for testing.
