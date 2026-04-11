using System;
using System.Runtime.CompilerServices;

namespace Mulkchi.Tests;

public static class TestEnvironmentInitializer
{
    [ModuleInitializer]
    public static void Initialize()
    {
        Environment.SetEnvironmentVariable(
            "MULKCHI_JWT_SECRET",
            "test-secret-key-with-minimum-length-for-jwt-32chars");
    }
}
