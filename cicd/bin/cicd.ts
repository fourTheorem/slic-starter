#!/usr/bin/env node
import 'source-map-support/register'
import cdk = require('@aws-cdk/cdk')
import { CicdStack } from '../lib/cicd-stack'

const app = new cdk.App()
new CicdStack(app, 'CicdStack')
