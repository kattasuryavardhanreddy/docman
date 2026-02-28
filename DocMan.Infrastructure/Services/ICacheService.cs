using System;
using System.Threading.Tasks;

namespace DocMan.Infrastructure.Services;

public interface ICacheService
{
    Task<T?> GetAsync<T>(string key);
    Task SetAsync<T>(string key, T value, TimeSpan ttl);
    Task RemoveAsync(string key);
    Task<long> IncrementAsync(string key);
    Task<bool> IsReadyAsync();
}