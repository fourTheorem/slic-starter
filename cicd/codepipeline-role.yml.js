'use strict'
const { moduleNames } = require('./modules')

module.exports = () => `
      Type: AWS::IAM::Role
      Properties:
        RoleName: $\{self:custom.stage}-slic-codepipeline-role
        AssumeRolePolicyDocument:
          Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Principal:
                Service: [codepipeline.amazonaws.com]
              Action: [sts:AssumeRole]
        Path: /
        Policies:
          - PolicyName: $\{self:custom.stage}-slic-codepipeline-policy
            PolicyDocument:
              Version: '2012-10-17'
              Statement:
                - Effect: Allow
                  Action: [sts:AssumeRole]
                  Resource:
                    - arn:aws:iam::$\{self:custom.accountIds.dev}:role/slic-cicd-deployment-role
                - Effect: Allow
                  Action:
                    - s3:DeleteObject
                    - s3:GetObject
                    - s3:GetObjectVersion
                    - s3:ListBucket
                    - s3:PutObject
                    - s3:GetBucketPolicy
                  Resource:
                    - arn:aws:s3:::$\{self:custom.buildBucket}
                    - arn:aws:s3:::$\{self:custom.buildBucket}/*
                - Effect: Allow
                  Action: [sns:Publish]
                  Resource:
                    - 'arn:aws:execute-api:#{AWS::Region}:#{AWS::AccountId}$\{self:custom.stage}-slic-sns-build-notification-topic'
                - Effect: Allow
                  Action:
                    - cloudformation:List*
                    - cloudformation:Get*
                    - cloudformation:PreviewStackUpdate
                    - cloudformation:ValidateTemplate
                  Resource:
                    - '*'
                - Effect: Allow
                  Action:
                    - cloudformation:CreateStack
                    - cloudformation:CreateUploadBucket
                    - cloudformation:DeleteStack
                    - cloudformation:Describe*
                    - cloudformation:UpdateStack
                  Resource:
                    - arn:aws:cloudformation:$\{self:custom.region}:*:stack/$\{self:custom.serviceName}-$\{self:custom.stage}/*
                - Effect: Allow
                  Action:
                    - lambda:Get*
                    - lambda:List*
                    - lambda:CreateFunction
                  Resource:
                    - '*'
                - Effect: Allow
                  Action:
                    - lambda:AddPermission
                    - lambda:CreateAlias
                    - lambda:DeleteFunction
                    - lambda:InvokeFunction
                    - lambda:PublishVersion
                    - lambda:RemovePermission
                    - lambda:Update*
                  Resource:
                    - arn:aws:lambda:$\{self:custom.region}:*:function:$\{self:custom.serviceName}-$\{self:custom.stage}-*
                - Effect: Allow
                  Action:
                    - lambda:AddPermission
                    - lambda:CreateAlias
                    - lambda:DeleteFunction
                    - lambda:InvokeFunction
                    - lambda:PublishVersion
                    - lambda:RemovePermission
                    - lambda:Update*
                  Resource:
                    - arn:aws:lambda:$\{self:custom.region}:*:function:$\{self:custom.serviceName}-$\{self:custom.stage}-*
                - Effect: Allow
                  Action:
                    - apigateway:GET
                    - apigateway:POST
                    - apigateway:PUT
                    - apigateway:DELETE
                  Resource:
                    - arn:aws:apigateway:*::/restapis*
                - Effect: Allow
                  Action:
                    - iam:PassRole
                  Resource:
                    - arn:aws:iam::*:role/*
                - Effect: Allow
                  Action: kinesis:*
                  Resource:
                    - arn:aws:kinesis:*:*:stream/$\{self:custom.serviceName}-$\{self:custom.stage}-$\{self:custom.region}
                - Effect: Allow
                  Action:
                    - iam:GetRole
                    - iam:CreateRole
                    - iam:PutRolePolicy
                    - iam:DeleteRolePolicy
                    - iam:DeleteRole
                  Resource:
                    - arn:aws:iam::*:role/$\{self:custom.serviceName}-$\{self:custom.stage}-$\{self:custom.region}-lambdaRole
                - Effect: Allow
                  Action: sqs:*
                  Resource:
                    - arn:aws:sqs:*:*:$\{self:custom.serviceName}-$\{self:custom.stage}-$\{self:custom.region}
                - Effect: Allow
                  Action:
                    - cloudwatch:GetMetricStatistics
                  Resource:
                    - '*'
                - Effect: Allow
                  Action:
                    - logs:CreateLogGroup
                    - logs:CreateLogStream
                    - logs:DeleteLogGroup
                  Resource:
                    - arn:aws:logs:$\{self:custom.region}:*:*
                - Effect: Allow
                  Action:
                    - logs:PutLogEvents
                  Resource:
                    - arn:aws:logs:$\{self:custom.region}:*:*
                - Effect: Allow
                  Action:
                    - logs:DescribeLogStreams
                    - logs:DescribeLogGroups
                    - logs:FilterLogEvents
                  Resource:
                    - '*'
                - Effect: Allow
                  Action:
                    - events:Put*
                    - events:Remove*
                    - events:Delete*
                  Resource:
                    - arn:aws:events:*:*:rule/$\{self:custom.serviceName}-$\{self:custom.stage}-$\{self:custom.region}
                - Effect: Allow
                  Action:
                    - dynamodb:*
                  Resource:
                    - arn:aws:dynamodb:*:*:table/*
                - Effect: Allow
                  Action:
                    - s3:CreateBucket
                  Resource:
                    - arn:aws:s3:::*
                - Effect: Allow
                  Action:
                    - codebuild:StartBuild
                    - codebuild:BatchGetBuilds
                    - codebuild:StopBuild
                  Resource:
                    - Fn::GetAtt: [ codebuildCheckChangesProject, Arn ]
${moduleNames
  .map(
    moduleName =>
      `                    - Fn::GetAtt: [ ${moduleName}BuildModuleProject, Arn ]
                    - Fn::GetAtt: [ ${moduleName}DeployStagingProject, Arn ]
`
  )
  .join('')}
`
