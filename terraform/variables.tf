variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "acr_name" {
  description = "Name of the Azure Container Registry"
  type        = string
}

variable "sql_server_name" {
  description = "SQL Server name"
  type        = string
}

variable "sql_admin_username" {
  description = "SQL admin username"
  type        = string
}

variable "sql_admin_password" {
  description = "SQL admin password"
  type        = string
  sensitive   = true
}

variable "sql_database_name" {
  description = "SQL database name"
  type        = string
}

variable "storage_account_name" {
  description = "Storage account name"
  type        = string
}

variable "storage_container_name" {
  description = "Blob container name"
  type        = string
}

variable "containerapps_environment_name" {
  description = "Container Apps Environment name"
  type        = string
}

variable "container_app_name" {
  description = "Test Container App name"
  type        = string
}

variable "container_image" {
  description = "Container image to deploy"
  type        = string
}