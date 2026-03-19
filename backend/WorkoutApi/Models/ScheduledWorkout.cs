namespace WorkoutApi.Models;

public class ScheduledWorkout
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid WorkoutDayTemplateId { get; set; }
    public WorkoutDayTemplate WorkoutDayTemplate { get; set; } = null!;

    public DateOnly ScheduledDate { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<ScheduledWorkoutExercise> Exercises { get; set; } = new();
}