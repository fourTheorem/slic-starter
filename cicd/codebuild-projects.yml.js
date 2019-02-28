'use strict'
const { moduleNames } = require('modules.js')

module.exports = () => `
    codebuildCheckChangesProject:
      Type: AWS::CodeBuild::Project
      Properties:
        Name: slic-codebuild-check-changes
        ServiceRole: { Fn::GetAtt: [codeBuildRole, Arn] }
        Source:
          Type: CODEPIPELINE
          BuildSpec: |
            version: 0.2

            phases:
              build:
                commands:
                  - ./build-scripts/check-changes.sh | tee changed-modules.env
            artifacts:
                files:
                    - '**/*'
        Artifacts:
          Type: CODEPIPELINE
          Packaging: NONE
        Environment: $\{file(./codebuild-environment.yml)}

${moduleNames.maps(
  moduleName => `
    ${moduleName}BuildModuleProject:
      Type: AWS::CodeBuild::Project
      Properties:
        Name: slic-build-module-${moduleName}
        ServiceRole: { Fn::GetAtt: [codeBuildRole, Arn] }
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
        Environment: $\{file(./codebuild-environment.yml)}
`
)}

${moduleNames.maps(
  moduleName => `
    ${moduleName}DeployStagingProject:
      Type: AWS::CodeBuild::Project
      Properties:
        Name: slic-deploy-staging-${module}
        ServiceRole: { Fn::GetAtt: [codeBuildRole, Arn] }
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
        Environment: $\{file(./codebuild-environment.yml)}
`
)}
`
