using DocMan.Infrastructure.Configuration;
using DocMan.Infrastructure.Data;
using DocMan.Infrastructure.Services;
using DocMan.Worker;
using Microsoft.EntityFrameworkCore;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.Configure<BlobOptions>(builder.Configuration.GetSection("Blob"));

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IBlobStorageService, BlobStorageService>();
builder.Services.AddHostedService<DocumentProcessorWorker>();

var host = builder.Build();
host.Run();
