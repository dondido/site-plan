$path = 'c:\git\site-plan\src\projects\catoctin-walk\plan.svg'
$content = Get-Content $path -Raw
$options = [System.Text.RegularExpressions.RegexOptions]::Multiline
$content = [regex]::Replace($content, '<polygon id="Building_[^"]*_3_"[^>]* />\s*\r\n', '', $options)
$content = [regex]::Replace($content, '<rect id="Building_[^"]*_3_"[^>]* />\s*\r\n', '', $options)
$content = [regex]::Replace($content, '<g id="(Building_[^"]*_3_)">\s*\r\n\s*(<[^>]+>)\s*\r\n\s*</g>', {
    param($match)
    $id = $match.Groups[1].Value
    $child = $match.Groups[2].Value
    $child -replace '^(<[^ >]+)', ('$1 id="' + $id + '"')
}, $options)
Set-Content $path $content