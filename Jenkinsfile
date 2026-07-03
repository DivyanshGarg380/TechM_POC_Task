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
                sh 'docker compose down || true'
                sh 'docker compose up -d --build'
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