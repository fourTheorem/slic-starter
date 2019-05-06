import { Construct } from '@aws-cdk/cdk'
import {
  Task,
  Wait,
  WaitDuration,
  Choice,
  Condition,
  Succeed,
  Fail
} from '@aws-cdk/aws-stepfunctions'
import { Function } from '@aws-cdk/aws-lambda'

export interface BuildJobProps {
  sourceLocationPath: string
  codeBuildProjectArn: string
  checkCodeBuildFunction: Function
  runCodeBuildFunction: Function
}

/**
 * A construct that represents a CodeBuild execution with a loop that waits and checks the result periodically
 * before succeeding or failing
 */
export class BuildJob extends Construct {
  readonly task: Task

  constructor(scope: Construct, id: string, props: BuildJobProps) {
    super(scope, id)

    this.task = new Task(this, `${id} build`, {
      resource: props.runCodeBuildFunction,
      parameters: {
        codeBuildProjectArn: props.codeBuildProjectArn,
        'sourceLocation.$': props.sourceLocationPath
      },
      inputPath: '$',
      resultPath: `$.runBuildResult.${id}`,
      outputPath: '$' // Pass all input to the output
    })

    const checkBuildTask = new Task(this, `Check ${id} status`, {
      resource: props.checkCodeBuildFunction,
      parameters: {
        'build.$': `$.runBuildResult.${id}.build`
      },
      inputPath: `$`,
      resultPath: `$.buildStatus.${id}`,
      outputPath: '$'
    })

    const waitForBuild = new Wait(this, `Wait for ${id}`, {
      duration: WaitDuration.seconds(10)
    })

    this.task.next(waitForBuild)
    waitForBuild.next(checkBuildTask)
    checkBuildTask.next(
      new Choice(this, `${id} done?`)
        .when(
          Condition.stringEquals(
            `$.buildStatus.${id}.buildStatus`,
            'SUCCEEDED'
          ),
          new Succeed(this, `Success ${id}`)
        )
        .when(
          Condition.stringEquals(
            `$.buildStatus.${id}.buildStatus`,
            'IN_PROGRESS'
          ),
          waitForBuild
        )
        .otherwise(new Fail(this, `Failure ${id}`))
    )
  }
}
