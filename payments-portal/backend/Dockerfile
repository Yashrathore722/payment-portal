# ── Build stage ───────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY PaymentsPortal.sln ./
COPY PaymentsPortal.API/PaymentsPortal.API.csproj PaymentsPortal.API/
COPY PaymentsPortal.Tests/PaymentsPortal.Tests.csproj PaymentsPortal.Tests/
RUN dotnet restore

COPY . .
RUN dotnet publish PaymentsPortal.API/PaymentsPortal.API.csproj -c Release -o /app/publish

# ── Runtime stage ─────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "PaymentsPortal.API.dll"]
