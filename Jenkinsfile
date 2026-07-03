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
                git branch: 'main', url: 'https://github.com/DivyanshGarg380/TechM_POC_Task.git'
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
                sh """
                    docker stop ${CONTAINER_NAME} || true
                    docker rm ${CONTAINER_NAME} || true
                """
            }
        }

        stage('Run New Container') {
            steps {
                sh """
                    docker run -d --name ${CONTAINER_NAME} \
                        -p ${APP_PORT}:8080 \
                        ${IMAGE_NAME}:latest
                """
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully. App is running at http://localhost:8080'
        }
        failure {
            echo 'Pipeline failed. Check console.'
        }
    }
}