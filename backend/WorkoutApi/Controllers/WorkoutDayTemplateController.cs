using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WorkoutApi.Data;
using WorkoutApi.Dtos.WorkoutDayTemplate;
using WorkoutApi.Models;

namespace WorkoutApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorkoutDayTemplateController : ControllerBase
{
    private readonly AppDbContext _context;

    public WorkoutDayTemplateController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetAll()
    {
        var templates = await _context.WorkoutDayTemplates
            .Include(x => x.Exercises)
                .ThenInclude(x => x.Exercise)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        var result = templates.Select(MapTemplateToResponse);

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<object>> GetById(Guid id)
    {
        var template = await _context.WorkoutDayTemplates
            .Include(x => x.Exercises.OrderBy(e => e.Order))
                .ThenInclude(x => x.Exercise)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (template is null)
            return NotFound();

        return Ok(MapTemplateToResponse(template));
    }

    [HttpPost]
    public async Task<ActionResult<object>> Create(CreateWorkoutDayTemplateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Name is required.");

        if (dto.EndTime < dto.StartTime)
            return BadRequest("EndTime cannot be earlier than StartTime.");

        var exerciseIds = dto.Exercises.Select(x => x.ExerciseId).Distinct().ToList();

        if (exerciseIds.Count > 0)
        {
            var existingExerciseIds = await _context.Exercises
                .Where(x => exerciseIds.Contains(x.Id))
                .Select(x => x.Id)
                .ToListAsync();

            var missingIds = exerciseIds.Except(existingExerciseIds).ToList();

            if (missingIds.Count > 0)
                return BadRequest(new
                {
                    Message = "Some exercise IDs do not exist.",
                    MissingExerciseIds = missingIds
                });
        }

        var template = new WorkoutDayTemplate
        {
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim(),
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Exercises = dto.Exercises
                .OrderBy(x => x.Order)
                .Select(x => new WorkoutDayTemplateExercise
                {
                    ExerciseId = x.ExerciseId,
                    Order = x.Order
                })
                .ToList()
        };

        _context.WorkoutDayTemplates.Add(template);
        await _context.SaveChangesAsync();

        var created = await _context.WorkoutDayTemplates
            .Include(x => x.Exercises.OrderBy(e => e.Order))
                .ThenInclude(x => x.Exercise)
            .FirstAsync(x => x.Id == template.Id);

        return CreatedAtAction(nameof(GetById), new { id = template.Id }, MapTemplateToResponse(created));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<object>> Update(Guid id, UpdateWorkoutDayTemplateDto dto)
    {
        var template = await _context.WorkoutDayTemplates
            .Include(x => x.Exercises)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (template is null)
            return NotFound();

        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Name is required.");

        if (dto.EndTime < dto.StartTime)
            return BadRequest("EndTime cannot be earlier than StartTime.");

        var exerciseIds = dto.Exercises.Select(x => x.ExerciseId).Distinct().ToList();

        if (exerciseIds.Count > 0)
        {
            var existingExerciseIds = await _context.Exercises
                .Where(x => exerciseIds.Contains(x.Id))
                .Select(x => x.Id)
                .ToListAsync();

            var missingIds = exerciseIds.Except(existingExerciseIds).ToList();

            if (missingIds.Count > 0)
                return BadRequest(new
                {
                    Message = "Some exercise IDs do not exist.",
                    MissingExerciseIds = missingIds
                });
        }

        template.Name = dto.Name.Trim();
        template.Description = dto.Description?.Trim();
        template.StartTime = dto.StartTime;
        template.EndTime = dto.EndTime;
        template.UpdatedAt = DateTime.UtcNow;

        _context.WorkoutDayTemplateExercises.RemoveRange(template.Exercises);

        template.Exercises = dto.Exercises
            .OrderBy(x => x.Order)
            .Select(x => new WorkoutDayTemplateExercise
            {
                WorkoutDayTemplateId = template.Id,
                ExerciseId = x.ExerciseId,
                Order = x.Order
            })
            .ToList();

        await _context.SaveChangesAsync();

        var updated = await _context.WorkoutDayTemplates
            .Include(x => x.Exercises.OrderBy(e => e.Order))
                .ThenInclude(x => x.Exercise)
            .FirstAsync(x => x.Id == template.Id);

        return Ok(MapTemplateToResponse(updated));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var template = await _context.WorkoutDayTemplates
            .FirstOrDefaultAsync(x => x.Id == id);

        if (template is null)
            return NotFound();

        _context.WorkoutDayTemplates.Remove(template);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static object MapTemplateToResponse(WorkoutDayTemplate template)
    {
        return new
        {
            template.Id,
            template.Name,
            template.Description,
            template.StartTime,
            template.EndTime,
            template.CreatedAt,
            template.UpdatedAt,
            Exercises = template.Exercises
                .OrderBy(x => x.Order)
                .Select(x => new
                {
                    x.Id,
                    x.ExerciseId,
                    x.Order,
                    Exercise = x.Exercise is null
                        ? null
                        : new
                        {
                            x.Exercise.Id,
                            x.Exercise.Name,
                            x.Exercise.Description,
                            x.Exercise.ImageUrl
                        }
                })
                .ToList()
        };
    }
}