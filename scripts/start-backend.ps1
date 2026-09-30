param(
    [string]$MySqlBin = 'C:\Program Files\MySQL\MySQL Server 8.0\bin',
    [ValidateRange(1024, 65535)][int]$Port = 3307
)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $projectRoot 'backend'
& (Join-Path $PSScriptRoot 'start-mysql.ps1') -MySqlBin $MySqlBin -Port $Port
$settings = Get-Content -LiteralPath (Join-Path $backend '.runtime\mysql\connection.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$jar = Join-Path $backend 'build\libs\vibe-menu-api-0.0.1-SNAPSHOT.jar'
if (!(Test-Path -LiteralPath $jar)) {
    Push-Location $backend
    try { & .\gradlew.bat bootJar --console=plain; if ($LASTEXITCODE -ne 0) { throw '백엔드 빌드 실패' } } finally { Pop-Location }
}
$listener = Get-NetTCPConnection -LocalPort 8090 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($listener) {
    $owner = Get-CimInstance Win32_Process -Filter ("ProcessId=" + $listener.OwningProcess)
    if ($owner.Name -ne 'java.exe' -or $owner.CommandLine -notlike ('*' + $jar + '*') -or $owner.CommandLine -notlike '*--spring.profiles.active=mysql*') {
        throw '8090 포트를 다른 서버가 사용 중입니다. 해당 서버는 종료하지 않습니다.'
    }
} else {
    $previous = @{}
    foreach ($name in @('DB_URL','DB_USERNAME','DB_PASSWORD')) { $previous[$name] = [Environment]::GetEnvironmentVariable($name, 'Process') }
    try {
        $env:DB_URL = 'jdbc:mysql://' + $settings.host + ':' + $settings.port + '/' + $settings.database + '?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Seoul'
        $env:DB_USERNAME = $settings.username
        $env:DB_PASSWORD = $settings.password
        $server = Start-Process -FilePath 'java.exe' -ArgumentList ('-Xms64m -Xmx256m -jar "' + $jar + '" --spring.profiles.active=mysql --server.port=8090') -WorkingDirectory $backend -RedirectStandardOutput (Join-Path $backend '.runtime\api.out.log') -RedirectStandardError (Join-Path $backend '.runtime\api.err.log') -WindowStyle Hidden -PassThru
        [IO.File]::WriteAllText((Join-Path $backend '.runtime\api.pid'), [string]$server.Id)
    } finally {
        foreach ($name in $previous.Keys) { [Environment]::SetEnvironmentVariable($name, $previous[$name], 'Process') }
    }
}
for ($attempt=0; $attempt -lt 60; $attempt++) {
    try { if ((Invoke-RestMethod 'http://127.0.0.1:8090/actuator/health' -TimeoutSec 2).status -eq 'UP') { Write-Host 'Spring Boot 준비 완료: http://localhost:8090 (MySQL)'; exit 0 } } catch { }
    Start-Sleep -Milliseconds 500
}
throw '서버 시작 대기 시간이 초과됐습니다. backend/.runtime/api.out.log와 api.err.log를 확인하세요.'
