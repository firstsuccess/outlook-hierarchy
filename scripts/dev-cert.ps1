$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSHOME 'Modules\Microsoft.PowerShell.Security\Microsoft.PowerShell.Security.psd1') -ErrorAction Stop
$projectDirectory = Split-Path -Parent $PSScriptRoot
$certificateDirectory = Join-Path $projectDirectory '.certs'
New-Item -ItemType Directory -Force -Path $certificateDirectory | Out-Null
$passphrase = [guid]::NewGuid().ToString('N')
$password = ConvertTo-SecureString $passphrase -AsPlainText -Force
$certificate = New-SelfSignedCertificate -DnsName 'localhost' -CertStoreLocation 'Cert:\CurrentUser\My' -FriendlyName 'Outlook Hierarchy localhost development' -NotAfter (Get-Date).AddMonths(6)
Export-PfxCertificate -Cert $certificate -FilePath (Join-Path $certificateDirectory 'localhost.pfx') -Password $password | Out-Null
Export-Certificate -Cert $certificate -FilePath (Join-Path $certificateDirectory 'localhost.cer') | Out-Null
[IO.File]::WriteAllText((Join-Path $certificateDirectory 'passphrase.txt'), $passphrase)
Import-Certificate -FilePath (Join-Path $certificateDirectory 'localhost.cer') -CertStoreLocation 'Cert:\CurrentUser\Root' | Out-Null
Write-Host 'Localhost HTTPS certificate ready (6 months). .certs must remain private and untracked.'
