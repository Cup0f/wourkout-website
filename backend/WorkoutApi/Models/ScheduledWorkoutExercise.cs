using WorkoutApi.Enums;

namespace WorkoutApi.Models;

public class ScheduledWorkoutExercise
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ScheduledWorkoutId { get; set; }
    public ScheduledWorkout ScheduledWorkout { get; set; } = null!;

    public Guid ExerciseId { get; set; }
    public Exercise Exercise { get; set; } = null!;

    public int Order { get; set; }
    public WorkoutExerciseStatus Status { get; set; } = WorkoutExerciseStatus.Todo;
}