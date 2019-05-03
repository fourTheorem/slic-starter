import { Construct } from '@aws-cdk/cdk'
import codeBuild = require('@aws-cdk/aws-codebuild')
import { defaultEnvironment } from '../code-build-environments'
import StageName from '../stage-name'
import config from '../../config'
import CodeBuildRole from '../code-build-role'
import {
  Parallel,
  Task,
  Choice,
  Condition,
  Succeed,
  Wait,
  WaitDuration,
  Fail
} from '@aws-cdk/aws-stepfunctions'
import { Function } from '@aws-cdk/aws-lambda'
import { S3BucketSource, S3BucketBuildArtifacts } from '@aws-cdk/aws-codebuild'
import { Bucket } from '@aws-cdk/aws-s3'

export interface BuildModulesStateProps {
  stageNo: number
  stageModules: string[]
  stageName: StageName
  codeBuildRole: CodeBuildRole
  checkCodeBuildFunction: Function
  runCodeBuildFunction: Function
  artifactsBucket: Bucket
}

export default class BuildModulesStage extends Construct {
  readonly buildModuleProjects: { [name: string]: codeBuild.Project } = {}
  readonly stageState: Parallel

  constructor(scope: Construct, props: BuildModulesStateProps) {
    super(scope, `${props.stageName}BuildStage${props.stageNo}`)

    const { stageName, stageModules, stageNo } = props

    this.stageState = new Parallel(this, `${stageName}Build${stageNo}`, {
      inputPath: '$',
      outputPath: '$.[0]' // Pass changes
    })

    stageModules.forEach(moduleName => {
      const artifacts = new S3BucketBuildArtifacts({
        bucket: props.artifactsBucket,
        name: `${stageName}_${moduleName}_build.zip`,
        includeBuildId: true,
        packageZip: true
      })

      this.buildModuleProjects[moduleName] = new codeBuild.Project(
        this,
        `${stageName}_${moduleName}_build_project`,
        {
          projectName: `${stageName}_${moduleName}_build`,
          artifacts,
          source: new S3BucketSource({
            bucket: props.artifactsBucket,
            path: '' // Path to be changed on override for each build
          }),
          buildSpec: {
            version: '0.2',
            env: {
              variables: {
                MODULE_NAME: moduleName
              }
            },
            phases: {
              install: {
                commands: ['bash ./build-scripts/install-phase.sh']
              },
              pre_build: {
                commands: ['bash ./build-scripts/pre_build-phase.sh']
              },
              build: {
                commands: [
                  `SLIC_STAGE=${stageName} CROSS_ACCOUNT_ID=${
                    config.accountIds[stageName]
                  } bash ./build-scripts/build-phase.sh`
                ]
              }
            },
            artifacts: {
              files: [
                '*.yml',
                '*.js',
                'build-scripts/**/*',
                `${moduleName}/*.yml`,
                `${moduleName}/*.js`,
                `${moduleName}/node_modules/**/*`,
                `${moduleName}/package.json`,
                `${moduleName}/package-lock.json`,
                `${moduleName}/build-artifacts/**/*`,
                `${moduleName}/build/**/*`,
                'module-config.env'
              ]
            }
          },
          environment: defaultEnvironment,
          role: props.codeBuildRole
        }
      )

      const moduleBuildTask = new Task(
        this,
        `${moduleName} ${stageName} build`,
        {
          resource: props.runCodeBuildFunction,
          parameters: {
            codeBuildProjectArn: this.buildModuleProjects[moduleName]
              .projectArn,
            'sourceLocation.$': '$.sourceLocation'
          },
          inputPath: '$',
          resultPath: `$.runBuildResult.${stageName}${moduleName}`,
          outputPath: '$' // Pass all input to the output
        }
      )

      const checkBuildTask = new Task(
        this,
        `Check ${moduleName} ${stageName} status`,
        {
          resource: props.checkCodeBuildFunction,
          parameters: {
            'build.$': `$.runBuildResult.${stageName}${moduleName}.build`
          },
          inputPath: `$`,
          resultPath: `$.buildStatus.${stageName}${moduleName}`,
          outputPath: '$'
        }
      )

      const waitForBuild = new Wait(
        this,
        `Wait for ${moduleName} ${stageName} build`,
        {
          duration: WaitDuration.seconds(10)
        }
      )

      moduleBuildTask.next(waitForBuild)
      waitForBuild.next(checkBuildTask)
      checkBuildTask.next(
        new Choice(this, `${stageName} ${moduleName} built?`)
          .when(
            Condition.stringEquals(
              `$.buildStatus.${stageName}${moduleName}.buildStatus`,
              'SUCCEEDED'
            ),
            new Succeed(this, `Success ${moduleName} ${stageName}`)
          )
          .when(
            Condition.stringEquals(
              `$.buildStatus.${stageName}${moduleName}.buildStatus`,
              'IN_PROGRESS'
            ),
            waitForBuild
          )
          .otherwise(new Fail(this, `Failure ${moduleName} ${stageName}`))
      )

      const ifChangedChoice = new Choice(
        this,
        `${moduleName} changed? ${stageName}`
      )
        .when(
          Condition.or(
            Condition.booleanEquals(`$.changes.${moduleName}`, true),
            Condition.booleanEquals('$.changes.all_modules', true)
          ),
          moduleBuildTask
        )
        .otherwise(new Succeed(this, `Skip ${stageName} ${moduleName}`))

      this.stageState.branch(ifChangedChoice)
    })
  }
}
