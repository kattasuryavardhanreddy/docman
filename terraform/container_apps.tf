# --- Logging & Environments (Primary/Secondary) ---
resource "azurerm_log_analytics_workspace" "logs_primary" {
  name                = "workspacedocmanrgb162tf"
  location            = var.location_primary
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_log_analytics_workspace" "logs_secondary" {
  name                = "workspacedocmanrg8e97tf"
  location            = var.location_secondary
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_container_app_environment" "env_primary" {
  name                       = "managedEnvironment-docmanrg-ae3ftf"
  location                   = var.location_primary
  resource_group_name        = azurerm_resource_group.rg.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.logs_primary.id
}

resource "azurerm_container_app_environment" "env_secondary" {
  name                       = "managedEnvironment-docmanrg-ac25tf"
  location                   = var.location_secondary
  resource_group_name        = azurerm_resource_group.rg.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.logs_secondary.id
}

# --- API ---
resource "azurerm_container_app" "api" {
  name                         = "docman-api-tf"
  container_app_environment_id = azurerm_container_app_environment.env_primary.id
  resource_group_name          = azurerm_resource_group.rg.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.apps_identity.id]
  }

  registry {
    server   = azurerm_container_registry.acr.login_server
    identity = azurerm_user_assigned_identity.apps_identity.id
  }

  template {
    container {
      name   = "docman-api"
      image  = "${azurerm_container_registry.acr.login_server}/docman-api:${var.image_tag}"
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "Jwt__Key"
        value = var.jwt_key
      }

      env {
        name  = "ConnectionStrings__DefaultConnection"
        value = "Server=tcp:${azurerm_mssql_server.sql.fully_qualified_domain_name},1433;Initial Catalog=${azurerm_mssql_database.db.name};User ID=docmanadmin;Password=${var.sql_admin_password};Encrypt=True;"
      }

      env {
        name  = "Blob__ConnectionString"
        value = azurerm_storage_account.storage.primary_connection_string
      }
    }
  }

  ingress {
    external_enabled = true
    target_port      = 5000
    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }
}


# --- UI ---
resource "azurerm_container_app" "ui" {
  name                         = "docman-ui-tf"
  container_app_environment_id = azurerm_container_app_environment.env_secondary.id
  resource_group_name          = azurerm_resource_group.rg.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.apps_identity.id]
  }

  registry {
    server   = azurerm_container_registry.acr.login_server
    identity = azurerm_user_assigned_identity.apps_identity.id
  }

  template {
    container {
      name   = "docman-ui"
      image  = "${azurerm_container_registry.acr.login_server}/docman-frontend:${var.image_tag}"
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "DOCMAN_API_BASE_URL"
        value = "https://${azurerm_container_app.api.ingress[0].fqdn}"
      }
      env {
        name  = "ConnectionStrings__DefaultConnection"
        value = "Server=tcp:${azurerm_mssql_server.sql.fully_qualified_domain_name},1433;Initial Catalog=${azurerm_mssql_database.db.name};User ID=docmanadmin;Password=${var.sql_admin_password};Encrypt=True;"
      }

      env {
        name  = "Blob__ConnectionString"
        value = azurerm_storage_account.storage.primary_connection_string
      }
    }
  }

  ingress {
    external_enabled = true
    target_port      = 3000
    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }
}

# --- Worker ---
resource "azurerm_container_app" "worker" {
  name                         = "docman-worker-tf"
  container_app_environment_id = azurerm_container_app_environment.env_secondary.id
  resource_group_name          = azurerm_resource_group.rg.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.apps_identity.id]
  }

  registry {
    server   = azurerm_container_registry.acr.login_server
    identity = azurerm_user_assigned_identity.apps_identity.id
  }

  template {
    min_replicas = 1
    max_replicas = 1

    container {
      name   = "docman-worker"
      image  = "${azurerm_container_registry.acr.login_server}/docman-worker:${var.image_tag}"
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "ConnectionStrings__DefaultConnection"
        value = "Server=tcp:${azurerm_mssql_server.sql.fully_qualified_domain_name},1433;Initial Catalog=${azurerm_mssql_database.db.name};User ID=docmanadmin;Password=${var.sql_admin_password};Encrypt=True;"
      }

      env {
        name  = "Blob__ConnectionString"
        value = azurerm_storage_account.storage.primary_connection_string
      }
    }
  }
}
