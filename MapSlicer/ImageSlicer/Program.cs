#pragma warning disable CA1416 // Validate platform compatibility
using System.Drawing;
using System.Globalization;

while (true)
{
    Console.Write("Image file:");
    var imageFilePath = Console.ReadLine() ?? "";
    imageFilePath = imageFilePath.Replace("\"", "");
    var outPath = Path.GetDirectoryName(imageFilePath)!;

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

    Console.Write("X:");
    decimal.TryParse(Console.ReadLine() ?? "", CultureInfo.InvariantCulture, out var getX);
    Console.Write("Y:");
    decimal.TryParse(Console.ReadLine() ?? "", CultureInfo.InvariantCulture, out var getY);
    getX--;
    getY--;

    var tileSize = 256;
    var tile = new Bitmap(tileSize, tileSize);
    for (var x = 0; x < tileSize; x++)
    {
        for (var y = 0; y < tileSize; y++)
        {
            var px = (int)Math.Floor(getX * tileSize + x);
            if (px >= srcImg.Width) continue;
            var py = (int)Math.Floor(getY * tileSize + y);
            if (py >= srcImg.Height) continue;

            var pixel = srcImg.GetPixel(px, py);
            tile.SetPixel(x, y, pixel);
        }
    }

    var outputPath = Path.Combine(outPath, $"{Path.GetFileNameWithoutExtension(imageFilePath)}_out.png");
    tile.Save(outputPath);
    srcImg.Dispose();
}

