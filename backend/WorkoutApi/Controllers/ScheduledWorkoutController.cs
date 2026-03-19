using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WorkoutApi.Data;
using WorkoutApi.Dtos.ScheduledWorkout;
using WorkoutApi.Enums;
using WorkoutApi.Models;

namespace WorkoutApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScheduledWorkoutController : ControllerBase
{
    private readonly AppDbContext _context;

    public ScheduledWorkoutController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetAll(
        [FromQuery] int? year,
        [FromQuery] int? month)
    {
        var query = _context.ScheduledWorkouts
            .Include(x => x.WorkoutDayTemplate)
            .Include(x => x.Exercises.OrderBy(e => e.Order))
                .ThenInclude(x => x.Exercise)
            .AsQueryable();

        if (year.HasValue && month.HasValue)
        {
            var start = new DateOnly(year.Value, month.Value, 1);
            var end = start.AddMonths(1);

            query = query.Where(x => x.ScheduledDate >= start && x.ScheduledDate < end);
        }

        var workouts = await query
            .OrderBy(x => x.ScheduledDate)
            .ThenBy(x => x.CreatedAt)
            .ToListAsync();

        return Ok(workouts.Select(MapScheduledWorkoutToResponse));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<object>> GetById(Guid id)
    {
        var workout = await _context.ScheduledWorkouts
            .Include(x => x.WorkoutDayTemplate)
            .Include(x => x.Exercises.OrderBy(e => e.Order))
                .ThenInclude(x => x.Exercise)
                    .ThenInclude(x => x.Muscles)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (workout is null)
            return NotFound();

        return Ok(MapScheduledWorkoutToResponse(workout));
    }

    [HttpPost]
    public async Task<ActionResult<object>> Create(CreateScheduledWorkoutDto dto)
    {
        var template = await _context.WorkoutDayTemplates
            .Include(x => x.Exercises.OrderBy(e => e.Order))
            .FirstOrDefaultAsync(x => x.Id == dto.WorkoutDayTemplateId);

        if (template is null)
            return BadRequest("WorkoutDayTemplate not found.");

        var scheduledWorkout = new ScheduledWorkout
        {
            WorkoutDayTemplateId = template.Id,
            ScheduledDate = dto.ScheduledDate,
            Note = dto.Note?.Trim(),
            CreatedAt = DateTime.UtcNow,
            Exercises = template.Exercises
                .OrderBy(x => x.Order)
                .Select(x => new ScheduledWorkoutExercise
                {
                    ExerciseId = x.ExerciseId,
                    Order = x.Order,
                    Status = WorkoutExerciseStatus.Todo
                })
                .ToList()
        };

        _context.ScheduledWorkouts.Add(scheduledWorkout);
        await _context.SaveChangesAsync();

        var created = await _context.ScheduledWorkouts
            .Include(x => x.WorkoutDayTemplate)
            .Include(x => x.Exercises.OrderBy(e => e.Order))
                .ThenInclude(x => x.Exercise)
            .FirstAsync(x => x.Id == scheduledWorkout.Id);

        return CreatedAtAction(nameof(GetById), new { id = scheduledWorkout.Id }, MapScheduledWorkoutToResponse(created));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<object>> Update(Guid id, UpdateScheduledWorkoutDto dto)
    {
        var workout = await _context.ScheduledWorkouts
            .Include(x => x.WorkoutDayTemplate)
            .Include(x => x.Exercises.OrderBy(e => e.Order))
                .ThenInclude(x => x.Exercise)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (workout is null)
            return NotFound();

        workout.ScheduledDate = dto.ScheduledDate;
        workout.Note = dto.Note?.Trim();

        await _context.SaveChangesAsync();

        return Ok(MapScheduledWorkoutToResponse(workout));
    }

    [HttpPatch("{scheduledWorkoutId:guid}/exercises/{scheduledWorkoutExerciseId:guid}/status")]
    public async Task<ActionResult<object>> UpdateExerciseStatus(
        Guid scheduledWorkoutId,
        Guid scheduledWorkoutExerciseId,
        UpdateScheduledWorkoutExerciseStatusDto dto)
    {
        var workout = await _context.ScheduledWorkouts
            .Include(x => x.WorkoutDayTemplate)
            .Include(x => x.Exercises.OrderBy(e => e.Order))
                .ThenInclude(x => x.Exercise)
            .FirstOrDefaultAsync(x => x.Id == scheduledWorkoutId);

        if (workout is null)
            return NotFound("ScheduledWorkout not found.");

        var exerciseItem = workout.Exercises.FirstOrDefault(x => x.Id == scheduledWorkoutExerciseId);

        if (exerciseItem is null)
            return NotFound("ScheduledWorkoutExercise not found.");

        exerciseItem.Status = dto.Status;

        await _context.SaveChangesAsync();

        return Ok(MapScheduledWorkoutToResponse(workout));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var workout = await _context.ScheduledWorkouts
            .FirstOrDefaultAsync(x => x.Id == id);

        if (workout is null)
            return NotFound();

        _context.ScheduledWorkouts.Remove(workout);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static object MapScheduledWorkoutToResponse(ScheduledWorkout workout)
    {
        return new
        {
            workout.Id,
            workout.WorkoutDayTemplateId,
            workout.ScheduledDate,
            workout.Note,
            workout.CreatedAt,
            WorkoutDayTemplate = workout.WorkoutDayTemplate is null
                ? null
                : new
                {
                    workout.WorkoutDayTemplate.Id,
                    workout.WorkoutDayTemplate.Name,
                    workout.WorkoutDayTemplate.Description,
                    workout.WorkoutDayTemplate.StartTime,
                    workout.WorkoutDayTemplate.EndTime
                },
            Exercises = workout.Exercises
                .OrderBy(x => x.Order)
                .Select(x => new
                {
                    x.Id,
                    x.ExerciseId,
                    x.Order,
                    x.Status,
                    Exercise = x.Exercise is null
                        ? null
                        : new
                        {
                            x.Exercise.Id,
                            x.Exercise.Name,
                            x.Exercise.Description,
                            x.Exercise.ImageUrl,
                            Muscles = x.Exercise.Muscles.Select(m => new
                            {
                                m.Id,
                                m.MuscleKey,
                                m.Role
                            }).ToList()
                        }
                })
                .ToList(),
            SummaryStatus = GetSummaryStatus(workout.Exercises)
        };
    }

    private static string GetSummaryStatus(IEnumerable<ScheduledWorkoutExercise> exercises)
    {
        var list = exercises.ToList();
        if (!list.Any())
            return "none";

        if (list.All(x => x.Status == WorkoutExerciseStatus.Done))
            return "done";

        if (list.Any(x => x.Status == WorkoutExerciseStatus.InProgress))
            return "in_progress";

        return list.Any(x => x.Status == WorkoutExerciseStatus.Todo) ? "todo" : "none";
    }
}