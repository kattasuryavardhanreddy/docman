terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "tfstate-rg"
    storage_account_name = "docmantfstate1234"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"
    use_oidc             = true 
  }
}

provider "azurerm" {
  features {}
}