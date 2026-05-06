namespace backend.Services;

public class AiServiceUnavailableException : Exception
{
    public AiServiceUnavailableException(string message, Exception? innerException = null)
        : base(message, innerException) { }
}
