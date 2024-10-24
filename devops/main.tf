terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  profile                     = "localstack"
  region                      = "ap-southeast-1"
  access_key                  = "test-key"
  secret_key                  = "test-secret"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    iam         = "http://localhost:4566"
    dynamodb    = "http://localhost:4566"
  }
}

#####################
# DynamoDB
#####################
module "dynamodb_table_app" {
  source             = "terraform-aws-modules/dynamodb-table/aws"
  version            = "4.0.0"
  name               = "app"
  billing_mode       = "PROVISIONED"
  read_capacity      = 3
  write_capacity     = 3
  hash_key           = "PK"
  range_key          = "SK"
  table_class        = "STANDARD"

  attributes = [
    {
      name = "PK"
      type = "S"
    },
    {
      name = "SK"
      type = "S"
    },
    {
      name = "GSI1PK"
      type = "S"
    },
    {
      name = "GSI1SK"
      type = "S"
    }
  ]

  global_secondary_indexes = [
    {
      name               = "GSI1"
      hash_key           = "GSI1PK"
      range_key          = "GSI1SK"
      projection_type    = "KEYS_ONLY"
      read_capacity      = 3
      write_capacity     = 3
    }
  ]
}

