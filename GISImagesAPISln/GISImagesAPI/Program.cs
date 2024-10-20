using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json.Nodes;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// Static cache for the keys

List<SecurityKey> signingKeys = new List<SecurityKey>();
DateTime keysLastFetched = DateTime.MinValue;
TimeSpan keysRefreshInterval = TimeSpan.FromHours(24);

async Task<List<SecurityKey>> GetSigningKeysAsync()
{
    if (signingKeys == null || DateTime.UtcNow - keysLastFetched > keysRefreshInterval)
    {
        var client = new HttpClient();
        var discoveryDocument = await client.GetStringAsync($"{builder.Configuration["Authority"]}/.well-known/openid-configuration");
        using var jsonDocument = JsonDocument.Parse(discoveryDocument);
        var jwksUri = jsonDocument.RootElement.GetProperty("jwks_uri").GetString();
        var keysDocument = await client.GetStringAsync(jwksUri);
        signingKeys = new JsonWebKeySet(keysDocument).GetSigningKeys().ToList();
        keysLastFetched = DateTime.UtcNow;
    }
    return signingKeys;
}

//add jwt bearer authentication with OIDC
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        //use the configuration / environment variables to set the authority
        options.Authority = builder.Configuration["Authority"];
        options.Audience = builder.Configuration["Audience"];
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
                        // Automatically retrieve and use the signing keys from the JWKS endpoint
            IssuerSigningKeyResolver = (token, securityToken, kid, parameters) =>
            {
                return GetSigningKeysAsync().Result;
            }
        };
    });
    

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
