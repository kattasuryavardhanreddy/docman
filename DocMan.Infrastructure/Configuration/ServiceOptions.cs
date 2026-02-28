namespace DocMan.Infrastructure.Configuration;

public class RedisOptions
{
    public string ConnectionString { get; set; } = "";
}

public class BlobOptions
{
    public string ConnectionString { get; set; } = "";
    public string ContainerName { get; set; } = "";
}