pipeline {
    agent any

    stages {

        stage('Pull Code') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-token',
                    url: 'https://github.com/Zulkar91/email_solutions.git'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'sonar-pip'

                    withSonarQubeEnv(
                        installationName: 'sonar-se',
                        credentialsId: 'sonar-token'
                    ) {
                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=email-solution \
                            -Dsonar.projectName=email-solution
                        """
                    }
                }
            }
        }

        stage('Build') {
            steps {
                sh 'docker build -t email-solution:latest .'
                sh 'trivy image email-solution:latest'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'Dockerhub-Cred',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_TOKEN'
                    )
                ]) {
                    sh '''
                        set -e

                        printf '%s' "$DOCKER_TOKEN" | docker login \
                            --username "$DOCKER_USERNAME" \
                            --password-stdin

                        docker tag email-solution:latest \
                            "$DOCKER_USERNAME/email-solution:latest"

                        docker push \
                            "$DOCKER_USERNAME/email-solution:latest"

                        docker logout
                    '''
                }
            }
        }

        stage('Deploy') {
            agent {
                label 'webpy'
            }

            steps {
                sh '''
                    set -e

                    docker pull zulkar786/email-solution:latest

                    docker stop email-solution || true
                    docker rm email-solution || true

                    docker run -d \
                        --name email-solution \
                        -p 8070:80 \
                        zulkar786/email-solution:latest
                '''
            }
        }

        stage('Cleanup Jenkins Agent') {
            steps {
                sh '''
                    echo "Cleaning unused Docker layers..."

                    docker image prune -f

                    echo "Docker cleanup completed."
                '''
            }
        }

        stage('Cleanup WebPy Agent') {
            agent {
                label 'webpy'
            }

            steps {
                sh '''
                    echo "Cleaning unused Docker layers on webpy..."

                    docker image prune -f

                    echo "WebPy Docker cleanup completed."
                '''
            }
        }
    }
}
