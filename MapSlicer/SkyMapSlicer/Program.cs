#pragma warning disable CA1416 // Validate platform compatibility
using System.Drawing;
using System.Drawing.Drawing2D;
using SkiaSharp.Views.Desktop;

Console.WriteLine("Image file:");
var imageFilePath = Console.ReadLine() ?? "";
imageFilePath = imageFilePath.Replace("\"", "");

Bitmap srcImg;
try
{
    srcImg = new Bitmap(imageFilePath);
}
catch (Exception ex)
{
    Console.WriteLine("Image not found or invalid file.");
    Console.WriteLine(ex.Message);
    return;
}

if (srcImg.Width != srcImg.Height && srcImg.Height != 4320)
{
    Console.WriteLine("Only supports image of 4320x4320.");
    return;
}

Console.WriteLine("Output folder:");
var outPath = Console.ReadLine() ?? "";
if (!Directory.Exists(outPath))
{
    Console.WriteLine("Output folder does not exist or is not a folder.");
    return;
}

void Scale(int zoomLevel)
{
    const int sourceW = 4320;
    const int tileW = 540;
    var chunks = zoomLevel switch
    {
        4 => 16,
        3 => 8,
        2 => 4,
        1 => 2,
        _ => 1
    };

    for (var x = 0; x < chunks; x++)
    for (var y = 0; y < chunks; y++)
    {
        var rect = new Rectangle(0, 0, tileW, tileW);
        var newImg = new Bitmap(tileW, tileW);
        newImg.SetResolution(srcImg.HorizontalResolution, srcImg.VerticalResolution);

        // https://stackoverflow.com/a/24199315/8523745
        using var graphics = Graphics.FromImage(newImg);
        graphics.CompositingMode = CompositingMode.SourceCopy;
        graphics.CompositingQuality = CompositingQuality.HighQuality;
        graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
        graphics.SmoothingMode = SmoothingMode.HighQuality;
        graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;

        var readW = sourceW / chunks;
        graphics.DrawImage(srcImg, rect, x * readW, y * readW, readW, readW, GraphicsUnit.Pixel);

        var outFolderPath = Path.Combine(outPath, zoomLevel.ToString());
        Directory.CreateDirectory(outFolderPath);

        var outFilePath = Path.Combine(outPath, zoomLevel.ToString(), $"{x}_{y}.webp");
        using var skImage = newImg.ToSKImage();
        using var skData = skImage.Encode(SkiaSharp.SKEncodedImageFormat.Webp, 90);
        using var file = File.OpenWrite(outFilePath);
        skData.SaveTo(file);
    }
}

for (var z = 0; z <= 3; z++)
    Scale(z);