# Deploy trustiva-lms to analytics.trustivasetu.com
Set-Location $PSScriptRoot\..

if (-not (Test-Path .env)) {
  Write-Host 'Missing .env'
  exit 1
}

function Get-EnvValue([string]$key) {
  $line = Get-Content .env | Where-Object { $_.StartsWith("$key=") } | Select-Object -First 1
  if (-not $line) { return $null }
  $line.Substring($key.Length + 1).Trim('"')
}

$vars = @('DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL', 'WEBHOOK_SECRET', 'LOS_API_KEY')
foreach ($name in $vars) {
  $val = Get-EnvValue $name
  if (-not $val) { Write-Host "Missing $name"; exit 1 }
  Write-Host "Setting Vercel env: $name"
  $val | vercel env add $name production --force --yes 2>&1 | Out-Null
}

$env:DATABASE_URL = Get-EnvValue 'DATABASE_URL'
Write-Host 'Running migrations...'
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host 'Seeding...'
npm run db:seed

Write-Host 'Deploying...'
vercel --prod --yes

Write-Host 'Live: https://analytics.trustivasetu.com'
