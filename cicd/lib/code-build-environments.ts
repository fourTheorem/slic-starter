import { ComputeType, LinuxBuildImage } from '@aws-cdk/aws-codebuild'

export const defaultEnvironment = {
  buildImage: LinuxBuildImage.STANDARD_2_0,
  computeType: ComputeType.SMALL,
  privileged: false
}

export const defaultRuntimes = {
  'runtime-versions': {
    nodejs: 10,
    python: 3.7
  }
}
