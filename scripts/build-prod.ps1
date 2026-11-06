# Script para compilar a producción usando .env.production
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Resolve-Path "$scriptDir\.."

Set-Location $rootDir
node "$scriptDir\build-prod.mjs"

