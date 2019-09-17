'use strict'
module.exports = () =>
  require('yamljs').parse(`

cognitoAuthorizer:
  Type: AWS::ApiGateway::Authorizer
  Properties:
    IdentitySource: method.request.header.Authorization
    Name: slic-user-pool-authorizer-checklist-service
    RestApiId:
      Ref: ApiGatewayRestApi
    Type: COGNITO_USER_POOLS
    ProviderARNs:
      - $\{ssm:/$\{self:provider.stage}/user-service/user-pool-arn}

slicTable:
  Type: AWS::DynamoDB::Table
  DeletionPolicy: Retain
  Properties:
    TableName: $\{self:custom.checklistTableName}
    AttributeDefinitions:
      - AttributeName: userId
        AttributeType: S
      - AttributeName: listId
        AttributeType: S
    KeySchema:
      - AttributeName: userId
        KeyType: HASH
      - AttributeName: listId
        KeyType: RANGE
    ProvisionedThroughput:
      ReadCapacityUnits: 2
      WriteCapacityUnits: 2

checklistServiceNameParameter:
  Type: AWS::SSM::Parameter
  Properties:
    Name: /$\{self:provider.stage}/checklist-service/url
    Type: String
    Value:
      Fn::Join:
        - ''
        - ['https://', {'Ref': 'ApiGatewayRestApi'}, '.execute-api.$\{self:provider.region}.amazonaws.com/$\{self:provider.stage}']

${
  process.env.SLIC_NS_DOMAIN
    ? `
# Workaround for "Invalid stage identifier specified"
# See https://github.com/serverless/serverless/issues/4029
resApiGatewayDeployment:
  Type: AWS::ApiGateway::Deployment
  DependsOn: ApiGatewayMethodPost
  Properties:
    StageName: $\{self:provider.stage}
    RestApiId:
      Ref: ApiGatewayRestApi

apiCustomDomainPathMappings:
  Type: AWS::ApiGateway::BasePathMapping
  Properties:
    BasePath: 'checklist'
    RestApiId:
      Ref: ApiGatewayRestApi
    DomainName: api.$\{self:custom.domainPrefixes.$\{self:provider.stage}}$\{env:SLIC_NS_DOMAIN}
    Stage: $\{self:provider.stage}
  DependsOn: resApiGatewayDeployment

`
    : ''
}`)
