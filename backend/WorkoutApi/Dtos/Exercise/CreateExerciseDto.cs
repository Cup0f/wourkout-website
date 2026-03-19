namespace WorkoutApi.Dtos.Exercise;

public class CreateExerciseDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public List<ExerciseMuscleDto> Muscles { get; set; } = new();
}

public class ExerciseMuscleDto
{
    public string MuscleKey { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}