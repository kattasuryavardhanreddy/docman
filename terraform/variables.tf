variable "location_primary" {
  type = string
}

variable "location_secondary" {
  type = string
}
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

variable "jwt_key" {
  type      = string
  sensitive = true
  default   = "KatT@$$UryA^@RdhaNReddy#18@99544Vi6a2InnOv@T>"
}
