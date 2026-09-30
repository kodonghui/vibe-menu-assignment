param([string]$MySqlBin = 'C:\Program Files\MySQL\MySQL Server 8.0\bin')
$ErrorActionPreference = 'Stop'
$backend = Join-Path (Split-Path -Parent $PSScriptRoot) 'backend'
$runtime = Join-Path $backend '.runtime\mysql'
$settingsFile = Join-Path $runtime 'connection.json'
$jar = Join-Path $backend 'build\libs\vibe-menu-api-0.0.1-SNAPSHOT.jar'
$listener = Get-NetTCPConnection -LocalPort 8090 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($listener) {
    $owner = Get-CimInstance Win32_Process -Filter ("ProcessId=" + $listener.OwningProcess)
    if ($owner.Name -ne 'java.exe' -or $owner.CommandLine -notlike ('*' + $jar + '*') -or $owner.CommandLine -notlike '*--spring.profiles.active=mysql*') {
        throw '8090 포트의 서버가 이 과제 서버가 아니므로 종료하지 않습니다.'
    }
    Stop-Process -Id $listener.OwningProcess
}
if (Test-Path -LiteralPath $settingsFile) {
    $settings = Get-Content -LiteralPath $settingsFile -Raw -Encoding UTF8 | ConvertFrom-Json
    $listener = Get-NetTCPConnection -LocalPort $settings.port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($listener) {
        $owner = Get-CimInstance Win32_Process -Filter ("ProcessId=" + $listener.OwningProcess)
        $serverFile = Join-Path $runtime 'my.ini'
        if ($owner.Name -ne 'mysqld.exe' -or $owner.CommandLine -notlike ('*' + $serverFile + '*')) {
            throw 'DB 포트의 서버가 이 과제 서버가 아니므로 종료하지 않습니다.'
        }
        & (Join-Path $MySqlBin 'mysqladmin.exe') ("--defaults-extra-file=" + (Join-Path $runtime 'admin.cnf')) shutdown
        if ($LASTEXITCODE -ne 0) { throw '과제 MySQL 정상 종료에 실패했습니다.' }
    }
}
Write-Host '과제 Spring Boot와 MySQL을 종료했습니다. DB 파일은 보존했습니다.'
