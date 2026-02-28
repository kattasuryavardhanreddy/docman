using DocMan.Infrastructure.Configuration;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using StackExchange.Redis;
using RedisDatabase = StackExchange.Redis.IDatabase;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace DocMan.Infrastructure.Services;

public class RedisCacheService : ICacheService
{
    private readonly ILogger<RedisCacheService> _logger;
    private readonly IConnectionMultiplexer? _redis;
    private readonly RedisDatabase _db;

    public RedisCacheService(IOptions<RedisOptions> options, ILogger<RedisCacheService> logger)
    {
        _logger = logger;
        try
        {
            _redis = ConnectionMultiplexer.Connect(options.Value.ConnectionString);
            _db = _redis.GetDatabase();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis connection failed. Caching disabled.");
        }
    }

    public async Task<T?> GetAsync<T>(string key)
    {
        if (_db == null) return default;
        try
        {
            var val = await _db.StringGetAsync(key);
            return val.HasValue ? JsonSerializer.Deserialize<T>(val!) : default;
        }
        catch { return default; }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan ttl)
    {
        if (_db == null) return;
        try
        {
            var json = JsonSerializer.Serialize(value);
            await _db.StringSetAsync(key, json, ttl);
        }
        catch { }
    }

    public async Task RemoveAsync(string key)
    {
        if (_db == null) return;
        try { await _db.KeyDeleteAsync(key); }
        catch { }
    }

    public async Task<long> IncrementAsync(string key)
    {
        if (_db == null) return 0;
        try { return await _db.StringIncrementAsync(key); }
        catch { return 0; }
    }

    public async Task<bool> IsReadyAsync()
    {
        if (_redis == null) return false;
        try
        {
            var result = await _db!.PingAsync();
            return result.TotalMilliseconds >= 0;
        }
        catch { return false; }
    }
}