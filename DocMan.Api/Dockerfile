FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["DocMan.Api/DocMan.Api.csproj", "DocMan.Api/"]
COPY ["DocMan.Core/DocMan.Core.csproj", "DocMan.Core/"]
COPY ["DocMan.Infrastructure/DocMan.Infrastructure.csproj", "DocMan.Infrastructure/"]
RUN dotnet restore "DocMan.Api/DocMan.Api.csproj"
COPY . .
WORKDIR "/src/DocMan.Api"
RUN dotnet build "DocMan.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "DocMan.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://0.0.0.0:5000
ENTRYPOINT ["dotnet", "DocMan.Api.dll"]