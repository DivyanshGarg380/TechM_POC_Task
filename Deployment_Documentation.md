# Dockerize & Automate Deployment Using Jenkins

Project: `employee-management-system` (Spring Boot 3.5.0, Java 17, MySQL)

**Repo layout** (`Employee_Management_Hub/`):
```
Employee_Management_Hub/
├── Backend/            ← Spring Boot app + Dockerfile goes here
├── Frontend/
├── docker-compose.yml  ← at repo root
├── Jenkinsfile         ← at repo root
└── README.md
```

## 1. Jenkins Basics & Setup

Jenkins is an open-source automation server used to build CI/CD pipelines: pulling code, building it, testing it, and deploying it automatically on every change.

**Run Jenkins via Docker (recommended, no local install needed):**
```bash
docker run -d --name jenkins -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -u root \
  jenkins/jenkins:lts
```
- `-v /var/run/docker.sock:/var/run/docker.sock` lets Jenkins run `docker build`/`docker run` on the host's Docker engine.
- Get the initial admin password: `docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword`
- Open `http://localhost:8080`, install suggested plugins, create an admin user.
- Install the **Docker Pipeline** plugin (Manage Jenkins → Plugins) so `docker` CLI steps work in the pipeline.
- Since the app also needs port 8080, either run the app container on a different host port (e.g. 8081:8080) or run Jenkins on a different port (e.g. `-p 9090:8080`).

## 2. Docker Setup

Install Docker Desktop (Windows/Mac) or Docker Engine (Linux) and verify with `docker --version`.

**Dockerfile** (multi-stage build — compiles with Maven, runs on a lightweight JRE):
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

**Build & run:**
```bash
docker build -t employee-management-system:latest .
docker run -d --name employee-app -p 8080:8080 employee-management-system:latest
```

Since the app needs MySQL, use `docker-compose.yml` (included) to spin up both the app and a MySQL container together:
```bash
docker compose up -d --build
```

Verify at `http://localhost:8080/swagger-ui.html`.

## 3. Jenkins Pipeline

A `Jenkinsfile` (Declarative Pipeline, included) automates:
1. **Checkout** – pulls latest code from the Git repo.
2. **Build with Maven** – `mvn clean package -DskipTests` produces the jar.
3. **Build Docker Image** – tags the image with `${BUILD_NUMBER}` and `latest`.
4. **Stop Old Container** – stops/removes any previously running container.
5. **Run New Container** – starts a fresh container from the latest image.

**Setup in Jenkins UI:**
1. New Item → Pipeline → name it (e.g. `employee-app-pipeline`).
2. Pipeline → Definition → "Pipeline script from SCM" → Git → paste your repo URL → set script path to `Jenkinsfile`.
3. Click **Build Now** to trigger manually, or add a **GitHub webhook** / **Poll SCM** trigger for automatic builds on push.

## 4. Screenshots to Capture (for submission)

- Jenkins Dashboard showing the pipeline job.
- Pipeline stage view after a successful build (all green stages).
- `docker images` output showing the built image.
- `docker ps` output showing the running container.
- Browser screenshot hitting `http://localhost:8080/swagger-ui.html` (or your app's endpoint).

## 5. Common Challenges & Fixes

| Challenge | Fix |
|---|---|
| Jenkins container can't run `docker` commands | Mount `/var/run/docker.sock` into the Jenkins container and install the Docker Pipeline plugin |
| Port 8080 conflict between Jenkins and the app | Map Jenkins to a different host port (e.g. `9090:8080`) or the app to `8081:8080` |
| App container can't reach MySQL | Use `docker-compose` so both containers share a network; point `spring.datasource.url` at the MySQL **service name** (`mysql`), not `localhost` |
| Old container blocks new container name | Add a "stop/remove old container" stage before "run new container" (included in Jenkinsfile) |
| Jenkins permission denied on docker.sock | Run the Jenkins container with `-u root`, or add the `jenkins` user to the `docker` group on the host |