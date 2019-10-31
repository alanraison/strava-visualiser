provider "aws" {
  version = "~> 2.0"
  region  = "eu-west-1"
}

provider "archive" {
  version = "~> 1.3"
}

terraform {
  required_version = "~> 0.12"
}

variable "client_id" {
  type = "string"
}

variable "client_secret" {
  type = "string"
}

resource "aws_api_gateway_rest_api" "token" {
  name = "token-exchange-api"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_resource" "token" {
  rest_api_id = aws_api_gateway_rest_api.token.id
  parent_id   = aws_api_gateway_rest_api.token.root_resource_id
  path_part   = "token"
}

resource "aws_api_gateway_model" "token_request" {
  rest_api_id  = aws_api_gateway_rest_api.token.id
  name         = "tokenRequest"
  content_type = "application/json"
  schema       = <<END
{  
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "grantType": { "type": "string" },
    "code": { "type": "string" },
    "refreshToken": { "type": "string" },
    "state": { "type": "string" }
  },
  "required": ["grantType"]
}
END
}

resource "aws_api_gateway_model" "token_response" {
  rest_api_id = aws_api_gateway_rest_api.token.id
  name = "tokenResponse"
  content_type = "application/json"
  schema = <<END
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "token_type": { "type": "string" },
    "expires_at": { "type": "number" },
    "expires_in": { "type": "number" },
    "refresh_token": { "type": "string" },
    "access_token": { "type": "string" },
    "athlete": { "type": "object" }
  }
}
END
}

resource "aws_api_gateway_method" "token_post" {
  rest_api_id   = aws_api_gateway_rest_api.token.id
  resource_id   = aws_api_gateway_resource.token.id
  http_method   = "POST"
  authorization = "NONE"
  request_models = {
    "application/json" : aws_api_gateway_model.token_request.name
  }
}

resource "aws_api_gateway_integration" "token" {
  rest_api_id             = aws_api_gateway_rest_api.token.id
  resource_id             = aws_api_gateway_resource.token.id
  http_method             = aws_api_gateway_method.token_post.http_method
  integration_http_method = "POST"
  type                    = "HTTP"
  uri                     = "https://www.strava.com/oauth/token"

  request_parameters = {
    "integration.request.querystring.client_id" = "stageVariables.clientId",
    "integration.request.querystring.client_secret" = "stageVariables.clientSecret",
  }

  request_templates = {
    "application/json" = <<END
#set($context.requestOverride.querystring.grant_type = $input.path('$.grantType'))
#set($context.requestOverride.querystring.code = $input.path('$.code'))
#set($context.requestOverride.querystring.refresh_token = $input.path('$.refreshToken'))
#set($context.requestOverride.querystring.state = $input.path('$.state'))
END
  }
}

resource "aws_api_gateway_stage" "stage" {
  rest_api_id = aws_api_gateway_rest_api.token.id
  stage_name = "v1"
  deployment_id = aws_api_gateway_deployment.deploy.id

  variables = {
    "clientId": var.client_id,
    "clientSecret": var.client_secret,
  }
}

resource "aws_api_gateway_deployment" "deploy" {
  depends_on = [aws_api_gateway_integration.token]
  rest_api_id = aws_api_gateway_rest_api.token.id
}

resource "aws_api_gateway_method_response" "response_200" {
  depends_on = [aws_api_gateway_model.token_response]
  rest_api_id = aws_api_gateway_rest_api.token.id
  resource_id = aws_api_gateway_resource.token.id
  http_method = aws_api_gateway_method.token_post.http_method
  status_code = 200

  response_models = {
    "application/json": aws_api_gateway_model.token_response.name
  }
}
