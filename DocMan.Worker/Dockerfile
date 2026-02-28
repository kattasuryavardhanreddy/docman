FROM mcr.microsoft.com/dotnet/runtime:9.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["DocMan.Worker/DocMan.Worker.csproj", "DocMan.Worker/"]
COPY ["DocMan.Core/DocMan.Core.csproj", "DocMan.Core/"]
COPY ["DocMan.Infrastructure/DocMan.Infrastructure.csproj", "DocMan.Infrastructure/"]
RUN dotnet restore "DocMan.Worker/DocMan.Worker.csproj"
COPY . .
WORKDIR "/src/DocMan.Worker"
RUN dotnet build "DocMan.Worker.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "DocMan.Worker.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DocMan.Worker.dll"]