using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using DocMan.Core.DTOs;
using DocMan.Tests.Helpers;
using Xunit;

namespace DocMan.Tests.IntegrationTests;

public class AuthTests : IClassFixture<TestWebApplicationFactory<Program>>
{
    private readonly TestWebApplicationFactory<Program> _factory;

    public AuthTests(TestWebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Register_Response_HasCorrectPropertyNames()
    {
        var client = _factory.CreateClient();
        var regReq = new { email = "contract@example.com", password = "StrongPassword123!" };
        
        var response = await client.PostAsJsonAsync("/api/v1/auth/register", regReq);
        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.True(doc.RootElement.TryGetProperty("accessToken", out _));
        Assert.True(doc.RootElement.TryGetProperty("expiresInSeconds", out _));
        
        var user = doc.RootElement.GetProperty("user");
        Assert.True(user.TryGetProperty("userId", out _));
        Assert.True(user.TryGetProperty("email", out _));
        Assert.True(user.TryGetProperty("createdAt", out _));
    }

    [Fact]
    public async Task Register_DuplicateEmail_ReturnsCorrectErrorEnvelope()
    {
        var client = _factory.CreateClient();
        var regReq = new { email = "dup@example.com", password = "StrongPassword123!" };
        
        await client.PostAsJsonAsync("/api/v1/auth/register", regReq);
        var res = await client.PostAsJsonAsync("/api/v1/auth/register", regReq);
        
        var json = await res.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);

        Assert.Equal(HttpStatusCode.Conflict, res.StatusCode);
        var error = doc.RootElement.GetProperty("error");
        Assert.Equal("conflict", error.GetProperty("code").GetString());
        Assert.True(error.TryGetProperty("message", out _));
        Assert.True(error.TryGetProperty("traceId", out _));
    }

    [Fact]
    public async Task Login_InvalidCreds_ReturnsUnauthorizedEnvelope()
    {
        var client = _factory.CreateClient();
        var loginReq = new { email = "wrong@example.com", password = "WrongPassword!" };
        
        var res = await client.PostAsJsonAsync("/api/v1/auth/login", loginReq);
        var json = await res.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
        var error = doc.RootElement.GetProperty("error");
        Assert.Equal("unauthorized", error.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Me_ReturnsCorrectPropertyNames()
    {
        var client = _factory.CreateClient();
        var regReq = new { email = "me@example.com", password = "StrongPassword123!" };
        var regRes = await client.PostAsJsonAsync("/api/v1/auth/register", regReq);
        var authData = await regRes.Content.ReadFromJsonAsync<AuthResponse>();

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", authData!.AccessToken);
        var res = await client.GetAsync("/api/v1/auth/me");
        
        var json = await res.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        Assert.True(doc.RootElement.TryGetProperty("userId", out _));
        Assert.True(doc.RootElement.TryGetProperty("email", out _));
        Assert.True(doc.RootElement.TryGetProperty("createdAt", out _));
    }
}