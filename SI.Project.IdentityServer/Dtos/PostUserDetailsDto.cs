﻿namespace SI.Project.IdentityServer.Dtos;

public class PostUserDetailsDto
{
    public string? GivenName { get; set; }
    public string? LastName { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? PublicKey { get; set; }
}