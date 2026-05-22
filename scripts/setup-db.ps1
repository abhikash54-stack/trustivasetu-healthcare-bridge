# Trustiva LMS — database setup (delegates to Node; works without Docker)
Set-Location $PSScriptRoot\..
node scripts/setup-db.mjs
exit $LASTEXITCODE
