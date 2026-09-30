param(
    [string]$MySqlBin = 'C:\Program Files\MySQL\MySQL Server 8.0\bin',
    [ValidateRange(1024, 65535)][int]$Port = 3307
)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$runtime = Join-Path $projectRoot 'backend\.runtime\mysql'
$data = Join-Path $runtime 'data'
$settingsFile = Join-Path $runtime 'connection.json'
$serverFile = Join-Path $runtime 'my.ini'
$adminFile = Join-Path $runtime 'admin.cnf'
$mysql = Join-Path $MySqlBin 'mysql.exe'
$mysqld = Join-Path $MySqlBin 'mysqld.exe'
$utf8 = New-Object System.Text.UTF8Encoding($false)
if (!(Test-Path -LiteralPath $mysql) -or !(Test-Path -LiteralPath $mysqld)) {
    throw 'MySQL 8.0 설치의 bin 경로를 -MySqlBin으로 지정하세요.'
}
if ((& $mysqld --no-defaults --version) -notmatch 'Ver 8\.0\.') { throw '이 실행 스크립트는 MySQL 8.0을 사용합니다.' }
New-Item -ItemType Directory -Path $runtime -Force | Out-Null
# 로컬 비밀번호와 DB 파일을 현재 Windows 사용자, SYSTEM, 관리자에게만 허용합니다.
$userSid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value
& icacls.exe $runtime /inheritance:r /grant:r ("*$($userSid):(OI)(CI)F") '*S-1-5-18:(OI)(CI)F' '*S-1-5-32-544:(OI)(CI)F' | Out-Null
if ($LASTEXITCODE -ne 0) { throw '로컬 DB 디렉터리의 접근 권한을 설정하지 못했습니다.' }
function New-LocalPassword {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
    [Convert]::ToBase64String($bytes)
}
if (Test-Path -LiteralPath $settingsFile) {
    $settings = Get-Content -LiteralPath $settingsFile -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($settings.port -ne $Port) { throw '기존 과제 DB 포트와 다릅니다. 기존 데이터 디렉터리를 덮어쓰지 않습니다.' }
} else {
    $settings = [pscustomobject]@{ host='127.0.0.1'; port=$Port; database='vibe_menu_assignment'; username='vibe_menu'; password=(New-LocalPassword); adminPassword=(New-LocalPassword); initialized=$false }
    [IO.File]::WriteAllText($settingsFile, ($settings | ConvertTo-Json), $utf8)
}
function Write-AdminConfig([string]$password) {
    [IO.File]::WriteAllText($adminFile, "[client]`nhost=127.0.0.1`nport=$Port`nprotocol=TCP`nuser=root`npassword=`"$password`"`ndefault-character-set=utf8mb4`n", $utf8)
}
$baseUnix = (Split-Path -Parent $MySqlBin).Replace('\','/')
$dataUnix = $data.Replace('\','/')
$errorUnix = (Join-Path $runtime 'mysql-error.log').Replace('\','/')
$serverConfig = @"
[mysqld]
basedir="$baseUnix"
datadir="$dataUnix"
port=$Port
bind-address=127.0.0.1
mysqlx=0
character-set-server=utf8mb4
collation-server=utf8mb4_0900_ai_ci
innodb-buffer-pool-size=64M
innodb-redo-log-capacity=64M
performance-schema=OFF
max-connections=20
log-error="$errorUnix"
"@
[IO.File]::WriteAllText($serverFile, $serverConfig, $utf8)
$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($listener) {
    $owner = Get-CimInstance Win32_Process -Filter ("ProcessId=" + $listener.OwningProcess)
    if ($owner.Name -ne 'mysqld.exe' -or $owner.CommandLine -notlike ('*' + $serverFile + '*')) {
        throw "포트 $Port 은 다른 프로그램이 사용 중입니다. 해당 프로그램은 변경하지 않습니다."
    }
} else {
    if (!(Test-Path -LiteralPath (Join-Path $data 'mysql'))) {
        if ((Test-Path -LiteralPath $data) -and @(Get-ChildItem -LiteralPath $data -Force).Count -gt 0) {
            throw '데이터 디렉터리가 비어 있지 않지만 초기화되지 않았습니다. 삭제하거나 재초기화하지 않습니다.'
        }
        & $mysqld ("--defaults-file=$serverFile") --initialize-insecure
        if ($LASTEXITCODE -ne 0) { throw 'MySQL 초기화 실패. backend/.runtime/mysql/mysql-error.log를 확인하세요.' }
    }
    $server = Start-Process -FilePath $mysqld -ArgumentList ('--defaults-file="' + $serverFile + '"') -WindowStyle Hidden -PassThru
    [IO.File]::WriteAllText((Join-Path $runtime 'mysql.pid'), [string]$server.Id, $utf8)
    $ready = $false
    for ($attempt=0; $attempt -lt 40; $attempt++) {
        if ($server.HasExited) { throw 'MySQL이 종료되었습니다. 로컬 오류 로그를 확인하세요.' }
        if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) { $ready=$true; break }
        Start-Sleep -Milliseconds 500
    }
    if (!$ready) { throw 'MySQL 시작 대기 시간이 초과됐습니다.' }
}
if (!$settings.initialized) {
    Write-AdminConfig ''
    $setupFile = Join-Path $runtime 'setup.sql'
    $setup = @"
CREATE DATABASE IF NOT EXISTS vibe_menu_assignment CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER IF NOT EXISTS 'vibe_menu'@'localhost' IDENTIFIED BY '$($settings.password)';
GRANT ALL PRIVILEGES ON vibe_menu_assignment.* TO 'vibe_menu'@'localhost';
ALTER USER 'root'@'localhost' IDENTIFIED BY '$($settings.adminPassword)';
"@
    [IO.File]::WriteAllText($setupFile, $setup, $utf8)
    try {
        $setupProcess = Start-Process -FilePath $mysql -ArgumentList ('--defaults-extra-file="' + $adminFile + '" --batch') -RedirectStandardInput $setupFile -RedirectStandardOutput (Join-Path $runtime 'setup.out.log') -RedirectStandardError (Join-Path $runtime 'setup.err.log') -WindowStyle Hidden -Wait -PassThru
        if ($setupProcess.ExitCode -ne 0) { throw '과제 DB 계정 준비 실패. 로컬 setup.err.log를 확인하세요.' }
        $settings.initialized = $true
        [IO.File]::WriteAllText($settingsFile, ($settings | ConvertTo-Json), $utf8)
    } finally { Remove-Item -LiteralPath $setupFile -ErrorAction SilentlyContinue }
}
Write-AdminConfig $settings.adminPassword
$verified = & $mysql ("--defaults-extra-file=$adminFile") --batch --skip-column-names '--execute=SELECT @@port, @@datadir;'
$verifiedPath = ([string]$verified).Replace('\\','/').Replace('\','/')
if ($LASTEXITCODE -ne 0 -or $verifiedPath -notlike ('*' + $dataUnix + '/*')) { throw '실제 데이터 디렉터리를 확인하지 못했습니다.' }
Write-Host "과제 MySQL 준비 완료: 127.0.0.1:$Port / vibe_menu_assignment"
