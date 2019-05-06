import { Construct } from '@aws-cdk/cdk'
import codeBuild = require('@aws-cdk/aws-codebuild')
import { defaultEnvironment } from '../code-build-environments'
import StageName from '../stage-name'
import config from '../../config'
import CodeBuildRole from '../code-build-role'
import {
  Parallel,
  Choice,
  Condition,
  Succeed
} from '@aws-cdk/aws-stepfunctions'
import { Function } from '@aws-cdk/aws-lambda'
import { S3BucketSource, S3BucketBuildArtifacts } from '@aws-cdk/aws-codebuild'
import { Bucket } from '@aws-cdk/aws-s3'
import { BuildJob } from './build-job'

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
      outputPath: '$' // Pass changes
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
                `${moduleName}/build/**/*`
              ]
            }
          },
          environment: defaultEnvironment,
          role: props.codeBuildRole
        }
      )

      const buildJob = new BuildJob(
        this,
        `${moduleName}_${stageName}_build_job`,
        {
          codeBuildProjectArn: this.buildModuleProjects[moduleName].projectArn,
          checkCodeBuildFunction: props.checkCodeBuildFunction,
          runCodeBuildFunction: props.runCodeBuildFunction,
          sourceLocationPath: '$.sourceLocation'
        }
      )

      const ifChangedChoice = new Choice(
        this,
        `${moduleName} changed? ${stageName} build`
      )
        .when(
          Condition.or(
            Condition.booleanEquals(`$.changes.${moduleName}`, true),
            Condition.booleanEquals('$.changes.all_modules', true)
          ),
          buildJob.task
        )
        .otherwise(new Succeed(this, `Skip ${stageName} ${moduleName} build`))

      this.stageState.branch(ifChangedChoice)
    })
  }
}
