// Matches this VPS's existing Jenkins convention (see nerdeydim/streamerdle):
// the Jenkins job builds/validates in its own ephemeral workspace, then the
// Deploy stage operates on a separate, persistent clone at
// /home/furkan/commitmuseum (git pull + docker compose up -d --build), since
// that's the directory the Jenkins container has bind-mounted from the host
// (along with the Docker socket) — see /home/furkan on the VPS.
//
// This app has no database, so the deploy stage doesn't need Prisma-style
// build-time env vars. docker-compose.prod.yml (unlike the repo's default
// docker-compose.yml) only runs the `app` service bound to 127.0.0.1:3003 —
// host Nginx + certbot handle TLS termination for this VPS, not the repo's
// own bundled nginx/certbot containers.
//
// One-time setup on the VPS:
//   git clone <repo-url> /home/furkan/commitmuseum
//   cd /home/furkan/commitmuseum
//   cp .env.example .env   # fill in real GITHUB_CLIENT_ID/SECRET, AUTH_SECRET, NEXTAUTH_URL
// Then add an Nginx site proxying to 127.0.0.1:3003.

pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timestamps()
    }

    environment {
        DEPLOY_DIR = '/home/furkan/commitmuseum'
    }

    stages {
        stage('Install dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint & typecheck') {
            steps {
                sh 'npm run lint'
                // Next.js 16 generates route-derived types (e.g. LayoutProps) via
                // `next typegen` instead of `next dev`/`next build` — without it,
                // tsc fails with "Cannot find name 'LayoutProps'" in CI.
                sh 'npx next typegen'
                sh 'npx tsc --noEmit'
            }
        }

        stage('Docker build') {
            steps {
                sh 'docker build -f docker/Dockerfile -t commitmuseum:${BUILD_NUMBER} .'
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    if [ ! -f "$DEPLOY_DIR/.env" ]; then
                        echo "Missing $DEPLOY_DIR/.env — copy .env.example there and fill it in first."
                        exit 1
                    fi
                    git config --global --add safe.directory "$DEPLOY_DIR"
                    cd "$DEPLOY_DIR"
                    git pull
                    docker compose -f docker-compose.prod.yml up -d --build
                '''
            }
        }

        stage('Health check') {
            steps {
                sh '''
                    for i in $(seq 1 15); do
                        if curl -sf "http://127.0.0.1:3003/" > /dev/null; then
                            echo "App is up."
                            exit 0
                        fi
                        sleep 2
                    done
                    echo "App did not become healthy in time."
                    cd "$DEPLOY_DIR" && docker compose -f docker-compose.prod.yml logs --tail=100 app
                    exit 1
                '''
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        failure {
            echo 'Deploy failed — check the stage logs above and `docker compose -f docker-compose.prod.yml logs app` in /home/furkan/commitmuseum on the VPS.'
        }
    }
}
