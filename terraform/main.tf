resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location_primary
}

resource "azurerm_container_registry" "acr" {
  name                = "docmanacr123tf"
  resource_group_name = azurerm_resource_group.rg.name
  location            = var.location_primary
  sku                 = "Basic"
  admin_enabled       = false
}

resource "azurerm_storage_account" "storage" {
  name                     = "docmanstorage2026tf"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = var.location_primary
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_mssql_server" "sql" {
  name                         = "docman-sql-servertf"
  resource_group_name          = azurerm_resource_group.rg.name
  location                     = var.location_primary
  version                      = "12.0"
  administrator_login          = "docmanadmin"
  administrator_login_password = var.sql_admin_password
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
