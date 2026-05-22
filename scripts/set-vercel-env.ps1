# Set production env on Vercel for analytics.trustivasetu.com
Set-Location $PSScriptRoot\..

$ProductionUrl = "https://analytics.trustivasetu.com"
$NextAuthSecret = [Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
$WebhookSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 40 | ForEach-Object { [char]$_ })
$LosKey = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 40 | ForEach-Object { [char]$_ })

if (-not $env:DATABASE_URL) {
  Write-Host "ERROR: Set DATABASE_URL first (Neon/Supabase production Postgres URL)."
  Write-Host '  $env:DATABASE_URL = "postgresql://..."'
  Write-Host "Then run this script again."
  exit 1
}

function Add-VercelEnv($Name, $Value) {
  Write-Host "Adding $Name ..."
  $Value | vercel env add $Name production --force --yes 2>&1 | Out-Host
}

Add-VercelEnv "DATABASE_URL" $env:DATABASE_URL
Add-VercelEnv "NEXTAUTH_SECRET" $NextAuthSecret
Add-VercelEnv "NEXTAUTH_URL" $ProductionUrl
Add-VercelEnv "WEBHOOK_SECRET" $WebhookSecret
Add-VercelEnv "LOS_API_KEY" $LosKey

Write-Host ""
Write-Host "Vercel production env set."
Write-Host "NEXTAUTH_URL = $ProductionUrl"
Write-Host "LOS_API_KEY (copy to LOS): $LosKey"
Write-Host ""
Write-Host "Deploy: vercel --prod"
