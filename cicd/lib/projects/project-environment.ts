import config from '../../config'

import { BuildEnvironmentVariableType } from '@aws-cdk/aws-codebuild'

export const projectEnvironmentVars: any = {}

if (config.nsDomain) {
  projectEnvironmentVars.SLIC_NS_DOMAIN = {
    type: BuildEnvironmentVariableType.PLAINTEXT,
    value: config.nsDomain
  }
} else {
  projectEnvironmentVars.SITE_BUCKET_PREFIX = {
    type: BuildEnvironmentVariableType.PLAINTEXT,
    value: config.siteBucketPrefix
  }
}
