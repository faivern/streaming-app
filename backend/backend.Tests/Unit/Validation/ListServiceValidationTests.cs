using backend.Constants;
using backend.Services;
using FluentAssertions;

namespace backend.Tests.Unit.Validation;

public class ListServiceValidationTests
{
    // ── ValidateListName ────────────────────────────────────────────────

    [Fact]
    public void ValidateListName_ValidName_ReturnsTrue()
    {
        var (isValid, error) = ListService.ValidateListName("My Favorites");

        isValid.Should().BeTrue();
        error.Should().BeNull();
    }

    [Fact]
    public void ValidateListName_Null_ReturnsFalse()
    {
        var (isValid, error) = ListService.ValidateListName(null!);

        isValid.Should().BeFalse();
        error.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void ValidateListName_Empty_ReturnsFalse()
    {
        var (isValid, error) = ListService.ValidateListName("");

        isValid.Should().BeFalse();
        error.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void ValidateListName_Whitespace_ReturnsFalse()
    {
        var (isValid, error) = ListService.ValidateListName("   ");

        isValid.Should().BeFalse();
        error.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void ValidateListName_ExactlyMaxLength_ReturnsTrue()
    {
        var name = new string('a', ValidationLimits.MaxListNameInputLength);

        var (isValid, error) = ListService.ValidateListName(name);

        isValid.Should().BeTrue();
        error.Should().BeNull();
    }

    [Fact]
    public void ValidateListName_OverMaxLength_ReturnsFalse()
    {
        var name = new string('a', ValidationLimits.MaxListNameInputLength + 1);

        var (isValid, error) = ListService.ValidateListName(name);

        isValid.Should().BeFalse();
        error.Should().Contain($"{ValidationLimits.MaxListNameInputLength}");
    }

    // ── ValidateThumbnail ───────────────────────────────────────────────

    [Fact]
    public void ValidateThumbnail_ValidJpeg_ReturnsTrue()
    {
        var jpegBytes = new byte[] { 0xFF, 0xD8, 0xFF, 0xE0, 0x00 };
        using var stream = new MemoryStream(jpegBytes);

        var (isValid, error) = ListService.ValidateThumbnail(stream, "photo.jpg", jpegBytes.Length);

        isValid.Should().BeTrue();
        error.Should().BeNull();
    }

    [Fact]
    public void ValidateThumbnail_ValidJpeg_WithJpegExtension_ReturnsTrue()
    {
        var jpegBytes = new byte[] { 0xFF, 0xD8, 0xFF, 0xE0, 0x00 };
        using var stream = new MemoryStream(jpegBytes);

        var (isValid, error) = ListService.ValidateThumbnail(stream, "photo.jpeg", jpegBytes.Length);

        isValid.Should().BeTrue();
        error.Should().BeNull();
    }

    [Fact]
    public void ValidateThumbnail_ValidPng_ReturnsTrue()
    {
        var pngBytes = new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x00 };
        using var stream = new MemoryStream(pngBytes);

        var (isValid, error) = ListService.ValidateThumbnail(stream, "photo.png", pngBytes.Length);

        isValid.Should().BeTrue();
        error.Should().BeNull();
    }

    [Fact]
    public void ValidateThumbnail_FileTooLarge_ReturnsFalse()
    {
        var bytes = new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 };
        using var stream = new MemoryStream(bytes);
        long tooLargeSize = ListService.MaxThumbnailBytes + 1;

        var (isValid, error) = ListService.ValidateThumbnail(stream, "photo.jpg", tooLargeSize);

        isValid.Should().BeFalse();
        error.Should().Contain("2 MB");
    }

    [Fact]
    public void ValidateThumbnail_InvalidExtension_ReturnsFalse()
    {
        var jpegBytes = new byte[] { 0xFF, 0xD8, 0xFF, 0xE0, 0x00 };
        using var stream = new MemoryStream(jpegBytes);

        var (isValid, error) = ListService.ValidateThumbnail(stream, "animation.gif", jpegBytes.Length);

        isValid.Should().BeFalse();
        error.Should().Contain("extension");
    }

    [Fact]
    public void ValidateThumbnail_StreamTooSmall_ReturnsFalse()
    {
        var tinyBytes = new byte[] { 0xFF, 0xD8, 0xFF }; // only 3 bytes, minimum is 4
        using var stream = new MemoryStream(tinyBytes);

        var (isValid, error) = ListService.ValidateThumbnail(stream, "photo.jpg", tinyBytes.Length);

        isValid.Should().BeFalse();
        error.Should().Contain("too small");
    }

    [Fact]
    public void ValidateThumbnail_WrongMagicBytesWithValidExtension_ReturnsFalse()
    {
        var fakeBytes = new byte[] { 0x00, 0x00, 0x00, 0x00, 0x00 };
        using var stream = new MemoryStream(fakeBytes);

        var (isValid, error) = ListService.ValidateThumbnail(stream, "photo.jpg", fakeBytes.Length);

        isValid.Should().BeFalse();
        error.Should().Contain("content");
    }

    [Fact]
    public void ValidateThumbnail_ResetsStreamPositionToZero()
    {
        var jpegBytes = new byte[] { 0xFF, 0xD8, 0xFF, 0xE0, 0x00 };
        using var stream = new MemoryStream(jpegBytes);

        ListService.ValidateThumbnail(stream, "photo.jpg", jpegBytes.Length);

        stream.Position.Should().Be(0);
    }

    [Fact]
    public void ValidateThumbnail_ExactlyMaxSize_ReturnsTrue()
    {
        var jpegBytes = new byte[] { 0xFF, 0xD8, 0xFF, 0xE0, 0x00 };
        using var stream = new MemoryStream(jpegBytes);

        var (isValid, _) = ListService.ValidateThumbnail(stream, "photo.jpg", ListService.MaxThumbnailBytes);

        isValid.Should().BeTrue();
    }
}
