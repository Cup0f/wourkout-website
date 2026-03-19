namespace WorkoutApi.Models;

public class WorkoutDayTemplate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    // üzleti adat
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    // log
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<WorkoutDayTemplateExercise> Exercises { get; set; } = new();
}