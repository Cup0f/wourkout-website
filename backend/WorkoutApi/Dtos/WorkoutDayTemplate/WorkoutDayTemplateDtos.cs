namespace WorkoutApi.Dtos.WorkoutDayTemplate;

public class WorkoutDayTemplateExerciseItemDto
{
    public Guid ExerciseId { get; set; }
    public int Order { get; set; }
}

public class CreateWorkoutDayTemplateDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public List<WorkoutDayTemplateExerciseItemDto> Exercises { get; set; } = new();
}

public class UpdateWorkoutDayTemplateDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public List<WorkoutDayTemplateExerciseItemDto> Exercises { get; set; } = new();
}