#!/usr/bin/env node
import 'source-map-support/register'
import cdk = require('@aws-cdk/cdk')
import { Cicd2Stack } from '../lib/cicd2-stack'

const app = new cdk.App()
new Cicd2Stack(app, 'Cicd2Stack')
