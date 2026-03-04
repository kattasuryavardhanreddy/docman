terraform {
  backend "azurerm" {
    resource_group_name  = "tfstate-rg"
    storage_account_name = "docmantfstate123"
    container_name       = "tfstate"
    key                  = "docman.tfstate"
  }
}