namespace WorkoutApi.Models;

public class WorkoutDayTemplateExercise
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid WorkoutDayTemplateId { get; set; }
    public WorkoutDayTemplate WorkoutDayTemplate { get; set; } = null!;
    
    public Guid ExerciseId { get; set; }
    public Exercise Exercise { get; set; } = null!;
    
    public int Order { get; set; }
}