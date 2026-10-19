Add-Type -AssemblyName System.Drawing
$outputDirectory = Join-Path (Split-Path -Parent $PSScriptRoot) 'public\assets'
New-Item -ItemType Directory -Force $outputDirectory | Out-Null
foreach ($size in @(16,32,64,80,128)) {
    $bitmap = New-Object System.Drawing.Bitmap($size,$size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.Clear([System.Drawing.Color]::FromArgb(0,104,173))
    $graphics.ScaleTransform(($size / 32.0), ($size / 32.0))
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 2)
    $graphics.DrawLine($pen,16,10,16,17)
    $graphics.DrawLine($pen,7,17,25,17)
    $graphics.DrawLine($pen,7,17,7,22)
    $graphics.DrawLine($pen,25,17,25,22)
    $graphics.FillRectangle([System.Drawing.Brushes]::White,12,5,8,7)
    $graphics.FillRectangle([System.Drawing.Brushes]::White,3,21,8,7)
    $graphics.FillRectangle([System.Drawing.Brushes]::White,21,21,8,7)
    $bitmap.Save((Join-Path $outputDirectory "icon-$size.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $pen.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
}
