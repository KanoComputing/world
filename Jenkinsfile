#!groovy
node {
    stage('check environment') {
        if (env.BRANCH_NAME=="master" || env.BRANCH_NAME=="jenkins") {
            env.DEV_ENV = "staging"
        } else if (env.BRANCH_NAME=="prod") {
            env.DEV_ENV = "production"
        }
        env.NODE_ENV = "${env.DEV_ENV}"
    }

    stage('checkout') {
        checkout scm
    }

    stage('clean') {
        sh "rm -rf src/bower_components"
        sh "bower cache clean"
    }

    stage('install dependencies') {
        sh "npm install --ignore-scripts"
        sh "bower install"
    }

    stage('build') {
        sh "gulp build"
    }

    stage('deploy') {
        if (env.BRANCH_NAME == "jenkins") {
            echo 'deploy skipped'
        } else if (env.NODE_ENV=="staging") {
            deploy_staging()
        } else if (env.NODE_ENV=="production") {
            deploy_prod()
        }
    }
}

def deploy_staging() {
    sh 'aws s3 sync ./www s3://new-world-staging.kano.me/new --region eu-west-1 --cache-control "max-age=600" --only-show-errors'
    // Also sync the index.html to the root folder for spa purposes
    sh 'aws s3 cp ./www/index.html s3://new-world-staging.kano.me/index.html --region eu-west-1'
}

def deploy_prod() {
    sh 'aws s3 sync ./www s3://new-world.kano.me/new --region us-west-1 --cache-control "max-age=600" --only-show-errors'
    // Also sync the index.html to the root folder for spa purposes
    sh 'aws s3 cp ./www/index.html s3://new-world.kano.me/index.html --region us-west-1'
}
