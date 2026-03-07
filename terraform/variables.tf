variable "location_primary" { default = "eastus" }
variable "location_secondary" { default = "eastus" }
variable "resource_group_name" { default = "docman-rg-tf" }

# Added to support CI/CD updates
variable "image_tag" {
  type    = string
  default = "latest"
}

variable "sql_admin_password" {
  type      = string
  sensitive = true
  default   = "Commvault!12"
}

variable "acr_name_override" {
  type        = string
  default     = null
  description = "Optional explicit Azure Container Registry name. If null, Terraform derives a stable unique name."
}

variable "storage_account_name_override" {
  type        = string
  default     = null
  description = "Optional explicit Storage Account name. If null, Terraform derives a stable unique name."
}

variable "sql_server_name_override" {
  type        = string
  default     = null
  description = "Optional explicit Azure SQL server name. If null, Terraform derives a stable unique name."
}

variable "jwt_key" {
  type      = string
  sensitive = true
  default   = "KatT@$$UryA^@RdhaNReddy#18@99544Vi6a2InnOv@T>"
}
