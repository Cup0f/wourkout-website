using WorkoutApi.Enums;

namespace WorkoutApi.Dtos.ScheduledWorkout;

public class CreateScheduledWorkoutDto
{
    public Guid WorkoutDayTemplateId { get; set; }
    public DateOnly ScheduledDate { get; set; }
    public string? Note { get; set; }
}

public class UpdateScheduledWorkoutDto
{
    public DateOnly ScheduledDate { get; set; }
    public string? Note { get; set; }
}

public class UpdateScheduledWorkoutExerciseStatusDto
{
    public WorkoutExerciseStatus Status { get; set; }
}