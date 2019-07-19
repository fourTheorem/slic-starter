import { ComputeType, LinuxBuildImage } from '@aws-cdk/aws-codebuild'

export const defaultEnvironment = {
  buildImage: LinuxBuildImage.fromDockerRegistry (
    'eoinsha/codebuild-nodejs-serverless:8.11.0'
  ),
  computeType: ComputeType.SMALL,
  privileged: false
}
