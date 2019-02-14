# SLIC Starter

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

SLIC Starter is a complete starter project for production-grade serverless applications on AWS. SLIC Starter uses an opinionated, pragmatic appraoch to structuring, developing and deploying a modern, serverless application with one simple, overarching goal:

> _Get your serverless application into production fast - first time and every time_

_How does SLIC starter help you to move so fast?_

1. Serverless development involves a lot of decisions around which approach to take for a multitude of issues. It aims to remove 80% of this decision making and let you focus on building valuable features.
1. It is deployable _out of the box_. Without making any code changes, you have a cloud-hosted production-grade app as a starting point for your product.
1. It comes with solutions for the common hard-to-solve problems such as project structuring, deployment, local environments, testing, monitoring and more. Read on to find out more!
1. It delivers a fully automated CI/CD build and deployment process that gives reassurances around the state and quality of each environment.
1. SLIC Starter fulfils all of the [SLIC Principles](https://slicsoftware.com), a set of best practices for _Serverless_, _Lean_, _Intelligent_, _Continuous_ development.

This project is free to use by enterprise, startups, students, educators, enthusiasts and skeptics alike. We actively encourage contributions, suggestions and questions from _anyone_.

## What does it provide?

### Structure

### Configuration

### Authentication

### User Accounts and Authorization

### Data Access with a RESTful API

### Messaging

### Front End UI

### CI/CD

### Testing

### Monitoring

### Logging

## Getting Started

## Local Development

In backend:

```
sls dynamodb install
```

Ensure that your AWS credentials are set to _some reasonable values_. For local development, any dummy value for `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` is sufficient. You can also opt to use an AWS profile if that's your preferred method for specifying AWS credentials.

```
sls offline start --migrate true
```

## Backend configuration for Frontend

When working in local development, the backend configuration is pulled from `.env.local`. When building the production frontend for any deployed _stage_, `npm run build` will, by default, generate a `.env.production` file. This file is `,gitignore`d so it will not be committed. The values for this file are dynamically generated using the CloudFormation outputs retrieved from the stage specified using the `SLIC_STAGE` environment variable.

## Demo

SLIC Starter provides a fully-featured application for managing checklists called _SLIC Lists_. SLIC Starter is self hosting, so SLIC Lists is continuously deployed to [sliclists.com](https://sliclists.com) from _this repository!_

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

Copyright fourTheorem Ltd. 2018. Distributed under the MIT License. See [LICENCE](LICENCE)
