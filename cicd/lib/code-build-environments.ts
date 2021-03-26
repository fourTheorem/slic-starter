import { ComputeType, LinuxBuildImage } from '@aws-cdk/aws-codebuild'

export const defaultEnvironment = {
  buildImage: LinuxBuildImage.STANDARD_3_0,
  computeType: ComputeType.SMALL,
  privileged: false
}

export const defaultRuntimes = {
  'runtime-versions': {
    nodejs: 12,
    python: 3.8
  }
}
