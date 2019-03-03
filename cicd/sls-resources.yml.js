'use strict'
const yaml = require('yamljs')
const { moduleNames } = require('./modules')
const { includeFile } = require('./serverless-util')

module.exports = () =>
  yaml.parse(`
artifactsBucket:
  Type: AWS::S3::Bucket
  Properties:
    BucketName: $\{self:custom.buildBucket}

artifactsBucketPolicy:
  Type: AWS::S3::BucketPolicy
  Properties:
    Bucket:
      Ref: artifactsBucket
    PolicyDocument:
      Version: '2012-10-17'
      Statement:
        - Effect: Allow
          Action:
            - s3:DeleteObject
            - s3:GetBucket*
            - s3:GetObject
            - s3:GetObjectVersion
            - s3:ListBucket
            - s3:PutObject
            - s3:GetBucketPolicy
          Resource:
            - arn:aws:s3:::$\{self:custom.buildBucket}
            - arn:aws:s3:::$\{self:custom.buildBucket}/*
          Principal:
            AWS: $\{self:custom.accountIds.dev}

codePipelineRole: ${includeFile('./codepipeline-role.yml.js')}

codeBuildRole:
${includeFile('./codebuild-role.yml')}

pipeline: ${includeFile('./codepipeline.yml.js')}

codebuildCheckChangesProject:
  Type: AWS::CodeBuild::Project
  Properties:
    Name: slic-check-changes
    ServiceRole:
      Fn::GetAtt: [codeBuildRole, Arn]
    Source:
      Type: CODEPIPELINE
      BuildSpec: |
        version: 0.2
        phases:
          build:
            commands:
              - bash ./build-scripts/check-changes.sh https://github.com/$\{self:custom.sourceRepoOwner}/$\{self:custom.sourceRepoName}.git $CODEBUILD_RESOLVED_SOURCE_VERSION
        artifacts:
            files:
                - '**/*'
    Artifacts:
      Type: CODEPIPELINE
      Packaging: NONE
    Environment:
${includeFile('./codebuild-environment.yml')}
      EnvironmentVariables:
        - GITHUB_TOKEN={{resolve:secretsmanager:CICD:SecretString:GitHubPersonalAccessToken}}

${moduleNames
    .map(
      moduleName => `
${moduleName}BuildModuleProject:
  Type: AWS::CodeBuild::Project
  Properties:
    Name: slic-build-module-${moduleName}
    ServiceRole:
      Fn::GetAtt: [codeBuildRole, Arn]
    Source:
      Type: CODEPIPELINE
      BuildSpec: |
        version: 0.2
        phases:
          install:
            commands:
              - ./build-scripts/install-phase.sh
          pre_build:
            commands:
              - ./build-scripts/pre_build-phase.sh
          build:
            commands:
              - ./build-scripts/build-phase.sh
          post_build:
            commands:
              - ./build-scripts/post_build-phase.sh
        artifacts:
            files:
                - 'changed-modules.env'
                - '${module}/build-artifacts'
    Artifacts:
      Type: CODEPIPELINE
      Packaging: NONE
    Environment:
${includeFile('./codebuild-environment.yml')}
`
    )
    .join('')}

${moduleNames
    .map(
      moduleName => `
${moduleName}DeployStagingProject:
  Type: AWS::CodeBuild::Project
  Properties:
    Name: slic-deploy-staging-${moduleName}
    ServiceRole:
      Fn::GetAtt: [codeBuildRole, Arn]
    Source:
      Type: CODEPIPELINE
      BuildSpec: |
        version: 0.2
        phases:
          build:
            commands:
              - ./build-scripts/deploy-module.sh
    Artifacts:
      Type: CODEPIPELINE
      Packaging: NONE
    Environment:
${includeFile('./codebuild-environment.yml')}
`
    )
    .join('')}
`)
