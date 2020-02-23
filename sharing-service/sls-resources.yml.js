'use strict'
module.exports = () =>
  require('yamljs').parse(`
cognitoAuthorizer:
  Type: AWS::ApiGateway::Authorizer
  Properties:
    IdentitySource: method.request.header.Authorization
    Name: slic-user-pool-authorizer-sharing-service
    RestApiId:
      Ref: ApiGatewayRestApi
    Type: COGNITO_USER_POOLS
    ProviderARNs:
      - $\{ssm:/$\{self:provider.stage}/user-service/user-pool-arn}

# The service's generated API Gateway URL is only used when no domain is defined
sharingServiceUrlParameter:
  Type: AWS::SSM::Parameter
  Properties:
    Name: /$\{self:provider.stage}/sharing-service/url
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
    BasePath: 'share'
    RestApiId:
      Ref: ApiGatewayRestApi
    DomainName: api.$\{self:custom.domainPrefixes.$\{self:provider.stage}}$\{env:SLIC_NS_DOMAIN}
    Stage: $\{self:provider.stage}
  DependsOn: resApiGatewayDeployment

`
    : ''
}`)
