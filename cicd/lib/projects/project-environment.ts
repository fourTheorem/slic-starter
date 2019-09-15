import config from '../../config'
import StageName from '../stage-name'

import { BuildEnvironmentVariableType } from '@aws-cdk/aws-codebuild'

export function projectEnvironmentVars(props: {
  stageName: StageName
  moduleName: string
}) {
  const siteVars: any = {}

  if (config.nsDomain) {
    siteVars.SLIC_NS_DOMAIN = {
      type: BuildEnvironmentVariableType.PLAINTEXT,
      value: config.nsDomain
    }
  } else {
    siteVars.SITE_BUCKET_PREFIX = {
      type: BuildEnvironmentVariableType.PLAINTEXT,
      value: config.siteBucketPrefix
    }
  }

  return {
    SLIC_STAGE: {
      type: BuildEnvironmentVariableType.PLAINTEXT,
      value: props.stageName
    },
    CROSS_ACCOUNT_ID: {
      type: BuildEnvironmentVariableType.PLAINTEXT,
      value: `${config.accountIds[props.stageName]}`
    },
    MODULE_NAME: {
      type: BuildEnvironmentVariableType.PLAINTEXT,
      value: props.moduleName
    },
    TARGET_REGION: {
      type: BuildEnvironmentVariableType.PLAINTEXT,
      value: `${config.defaultRegions[props.stageName]}`
    },
    ...siteVars
  }
}
