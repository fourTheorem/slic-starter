'use strict'
const { moduleNames, deployOrder } = require('./modules')

module.exports = () => `
      Type: AWS::CodePipeline::Pipeline
      Properties:
        Name: $\{self:custom.stage}-slic-codepipeline
        RoleArn:
          Fn::GetAtt: [codePipelineRole, Arn]
        Stages:
          - Name: Source
            Actions:
              - Name: SourceAction
                ActionTypeId:
                  Category: Source
                  Owner: ThirdParty
                  Provider: GitHub
                  Version: 1
                RunOrder: 1
                Configuration:
                  Owner: $\{self:custom.sourceRepoOwner}
                  Repo: $\{self:custom.sourceRepoName}
                  Branch: feature/advanced-cicd-#19
                  OAuthToken: '{{resolve:secretsmanager:CICD:SecretString:GitHubPersonalAccessToken}}'
                  PollForSourceChanges: true
                OutputArtifacts:
                  - Name: $\{self:custom.stage}-slic-source
          - Name: CheckChanges
            Actions:
              - Name: CheckChanges
                InputArtifacts:
                  - Name: $\{self:custom.stage}-slic-source
                OutputArtifacts:
                  - Name: $\{self:custom.stage}-slic-source-checked
                ActionTypeId:
                  Category: Build
                  Owner: AWS
                  Version: 1
                  Provider: CodeBuild
                Configuration:
                  ProjectName: slic-check-changes
                RunOrder: 1
          - Name: BuildModules
            Actions:
      ${moduleNames
        .map(
          moduleName => `
              - Name: build_${moduleName}
                InputArtifacts:
                  - Name: $\{self:custom.stage}-slic-source-checked
                OutputArtifacts:
                  - Name: $\{self:custom.stage}-slic-built-${moduleName}
                ActionTypeId:
                  Category: Build
                  Owner: AWS
                  Version: 1
                  Provider: CodeBuild
                Configuration:
                  ProjectName: slic-build-${moduleName}
                RunOrder: 1
`
        )
        .join('')}
          - Name: StagingDeploy
            Actions:
      ${moduleNames
        .map(
          moduleName => `
              - Name: staging_deploy_${moduleName}
                InputArtifacts:
                  - Name: $\{self:custom.stage}-slic-built-${moduleName}
                ActionTypeId:
                  Category: Build
                  Owner: AWS
                  Version: 1
                  Provider: CodeBuild
                Configuration:
                  ProjectName: slic-deploy-stg-${moduleName}
                RunOrder: ${deployOrder[moduleName]}
`
        )
        .join('')}
          - Name: IntegrationTest
            Actions:
              - Name: IntegrationTest
                InputArtifacts:
                  - Name: $\{self:custom.stage}-slic-source
                ActionTypeId:
                  Category: Build
                  Owner: AWS
                  Version: 1
                  Provider: CodeBuild
                Configuration:
                  ProjectName: slic-integration-test
                RunOrder: 1
        ArtifactStore:
          Type: S3
          Location: $\{self:custom.buildBucket}
`
