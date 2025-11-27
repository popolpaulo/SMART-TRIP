param(
    [string]$BaseUrl = "http://localhost:3000"
)

Write-Host "=== Test AI Flight Comparator ===" -ForegroundColor Cyan

$departureDate = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
$returnDate = (Get-Date).AddDays(37).ToString("yyyy-MM-dd")

$body = @{ 
  origin = "CDG" 
  destination = "JFK" 
  departureDate = $departureDate 
  returnDate = $returnDate 
  adults = 1 
  travelClass = "ECONOMY" 
} | ConvertTo-Json

Write-Host "Requesting smartSearch (CDG -> JFK) | $departureDate -> $returnDate" -ForegroundColor Yellow

try {
  $response = Invoke-RestMethod -Uri "$BaseUrl/api/flights/search" -Method Post -Body $body -ContentType "application/json"
} catch {
  Write-Host "Request failed: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

if (-not $response.flights) {
  Write-Host "No flights returned." -ForegroundColor Red
  exit 1
}

Write-Host "Top 3 AI-scored flights:" -ForegroundColor Green
$response.flights | Select-Object -First 3 | ForEach-Object {
  $score = $_.aiScore
  $price = $_.price.total
  $currency = $_.price.currency
  $recLevel = $_.aiRecommendation.level
  $recMsg = $_.aiRecommendation.message
  Write-Host ("ID={0} | Price={1}{2} | Score={3} | {4} - {5}" -f $_.id, $price, $currency, $score, $recLevel, $recMsg)
}

Write-Host "Full meta: search time=$($response.meta.searchTime)ms sources=$($response.meta.sources -join ',') flights=$($response.meta.totalResults)" -ForegroundColor DarkCyan

Write-Host "=== Done ===" -ForegroundColor Cyan
