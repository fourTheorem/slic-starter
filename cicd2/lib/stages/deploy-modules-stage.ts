import { Construct } from '@aws-cdk/cdk'
import codeBuild = require('@aws-cdk/aws-codebuild')
import { defaultEnvironment } from '../code-build-environments'
import StageName from '../stage-name'
import config from '../../config'
import CodeBuildRole from '../code-build-role'
import { Bucket } from '@aws-cdk/aws-s3'
import {
  Parallel,
  Choice,
  Condition,
  Succeed
} from '@aws-cdk/aws-stepfunctions'
import { BuildJob } from './build-job'
import { Function } from '@aws-cdk/aws-lambda'

export interface DeployModulesStageProps {
  stageNo: number
  stageModules: string[]
  stageName: StageName
  codeBuildRole: CodeBuildRole
  checkCodeBuildFunction: Function
  runCodeBuildFunction: Function
  artifactsBucket: Bucket
}

export default class DeployModulesStage extends Construct {
  readonly deployModuleProjects: { [name: string]: codeBuild.Project } = {}
  readonly stageState: Parallel

  constructor(scope: Construct, props: DeployModulesStageProps) {
    super(scope, `${props.stageName}DeployStage${props.stageNo}`)

    const { stageName, stageModules, stageNo } = props

    this.stageState = new Parallel(this, `${stageName}Deploy${stageNo}`, {
      inputPath: '$',
      outputPath: '$.[0]'
    })

    stageModules.forEach((moduleName, moduleIndex) => {
      this.deployModuleProjects[moduleName] = new codeBuild.Project(
        this,
        `${stageName}_${moduleName}_deploy_project`,
        {
          projectName: `${stageName}_${moduleName}_deploy`,
          buildSpec: {
            version: '0.2',
            env: {
              variables: {
                MODULE_NAME: moduleName,
                SLIC_STAGE: stageName,
                CROSS_ACCOUNT_ID: config.accountIds[stageName]
              }
            },
            phases: {
              build: {
                commands: [`bash ./build-scripts/deploy-module.sh`]
              }
            }
          },
          environment: defaultEnvironment,
          role: props.codeBuildRole
        }
      )

      const deployJob = new BuildJob(
        this,
        `${moduleName}_${stageName}_deploy_job`,
        {
          codeBuildProjectArn: this.deployModuleProjects[moduleName].projectArn,
          checkCodeBuildFunction: props.checkCodeBuildFunction,
          runCodeBuildFunction: props.runCodeBuildFunction,
          sourceLocationPath: `$.[${moduleIndex}].runBuildResult.${moduleName}_${stageName}_build_job`
        }
      )

      const ifChangedChoice = new Choice(
        this,
        `${moduleName} changed? ${stageName} deploy`
      )
        .when(
          Condition.or(
            Condition.booleanEquals(`$.changes.${moduleName}`, true),
            Condition.booleanEquals('$.changes.all_modules', true)
          ),
          deployJob.task
        )
        .otherwise(new Succeed(this, `Skip ${stageName} ${moduleName} deploy`))

      this.stageState.branch(ifChangedChoice)
    })
  }
}
