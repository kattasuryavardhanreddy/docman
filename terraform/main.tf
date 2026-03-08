resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location_primary
}

data "azurerm_client_config" "current" {}

locals {
  # Use a stable seed so names are deterministic across reruns for the same subscription + RG.
  name_seed = "${data.azurerm_client_config.current.subscription_id}-${var.resource_group_name}"

  # ACR: lowercase alphanumeric, 5-50 chars.
  acr_name = "docmanacr${substr(md5("${local.name_seed}-acr"), 0, 16)}"

  # Storage Account: lowercase alphanumeric, 3-24 chars.
  storage_account_name = "docmanst${substr(md5("${local.name_seed}-storage"), 0, 16)}"

  # Azure SQL server names are globally unique.
  sql_server_name = "docman-sql-servertf-${substr(md5("${local.name_seed}-sql"), 0, 10)}"
}

resource "azurerm_container_registry" "acr" {
  name                = local.acr_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = var.location_primary
  sku                 = "Basic"
  admin_enabled       = false
}

resource "azurerm_storage_account" "storage" {
  name                     = local.storage_account_name
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = var.location_primary
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_mssql_server" "sql" {
  name                          = local.sql_server_name
  resource_group_name           = azurerm_resource_group.rg.name
  location                      = var.location_primary
  version                       = "12.0"
  administrator_login           = "docmanadmin"
  administrator_login_password  = var.sql_admin_password
  public_network_access_enabled = true
}

# Allow Container Apps to reach the DB
resource "azurerm_mssql_firewall_rule" "allow_azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.sql.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

resource "azurerm_mssql_database" "db" {
  name      = "DocManDbtf"
  server_id = azurerm_mssql_server.sql.id
  sku_name  = "Basic"
}

resource "azurerm_user_assigned_identity" "apps_identity" {
  name                = "id-docman-appstf"
  resource_group_name = azurerm_resource_group.rg.name
  location            = var.location_primary
}

resource "azurerm_role_assignment" "acr_pull" {
  scope                = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.apps_identity.principal_id
}
