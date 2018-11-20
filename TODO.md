# TODOs

- Add KMS to built artifacts in S3 between accounts
- Check CORS setting in functions yml
- Add unit tests
- Add integration tests
- Add CI/CD
- Add CloudWatch logs
- Add offline, progressive UI behaviour
- Data migrations
- Backups
- Provide local development experience
  -- Cognito in local mode
- Check if CloudTrail ON is a reasonable first step

# DONE

- A SPA with React using AWS Cognito, Material UI
- A REST API with CRUD
- DynamoDB resources
- Authentiaction with Cognito

- CodePipeline and CodeBuild for CICD

                    OAuthToken: "{{resolve:ssm-secure:GitHubPersonalAccessToken:1}}"
                    PollForSourceChanges: false

                    SSM Secure reference is not supported in: [AWS::CodePipeline::Pipeline/Properties/Stages]

                    https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/dynamic-references.html

  o
