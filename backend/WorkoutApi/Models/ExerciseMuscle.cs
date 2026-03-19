using WorkoutApi.Enums;

namespace WorkoutApi.Models;

public class ExerciseMuscle
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid ExerciseId { get; set; }
    public Exercise Exercise { get; set; } = null!;

    public string MuscleKey { get; set; } = string.Empty;
    public MuscleRole Role { get; set; }
}

