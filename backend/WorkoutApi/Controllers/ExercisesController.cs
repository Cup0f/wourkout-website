using WorkoutApi.Data;
using WorkoutApi.Dtos.Exercise;
using WorkoutApi.Enums;
using WorkoutApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WorkoutApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExercisesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ExercisesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Exercise>>> GetAll()
    {
        var exercises = await _context.Exercises
            .Include(x => x.Muscles)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(exercises);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Exercise>> GetById(Guid id)
    {
        var exercise = await _context.Exercises
            .Include(x => x.Muscles)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (exercise is null)
            return NotFound();

        return Ok(exercise);
    }

    [HttpPost]
    public async Task<ActionResult<Exercise>> Create(CreateExerciseDto dto)
    {
        var exercise = new Exercise
        {
            Name = dto.Name,
            Description = dto.Description,
            ImageUrl = dto.ImageUrl,
            Muscles = dto.Muscles.Select(x => new ExerciseMuscle
            {
                MuscleKey = x.MuscleKey,
                Role = ParseRole(x.Role)
            }).ToList()
        };

        _context.Exercises.Add(exercise);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = exercise.Id }, exercise);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<Exercise>> Update(Guid id, UpdateExerciseDto dto)
    {
        var exercise = await _context.Exercises
            .Include(x => x.Muscles)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (exercise is null)
            return NotFound();

        exercise.Name = dto.Name;
        exercise.Description = dto.Description;
        exercise.ImageUrl = dto.ImageUrl;
        exercise.UpdatedAt = DateTime.UtcNow;

        _context.ExerciseMuscles.RemoveRange(exercise.Muscles);

        exercise.Muscles = dto.Muscles.Select(x => new ExerciseMuscle
        {
            MuscleKey = x.MuscleKey,
            Role = ParseRole(x.Role)
        }).ToList();

        await _context.SaveChangesAsync();

        return Ok(exercise);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var exercise = await _context.Exercises.FirstOrDefaultAsync(x => x.Id == id);

        if (exercise is null)
            return NotFound();

        _context.Exercises.Remove(exercise);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static MuscleRole ParseRole(string role)
    {
        return role.Trim().ToLower() switch
        {
            "primary" => MuscleRole.Primary,
            "secondary" => MuscleRole.Secondary,
            _ => throw new ArgumentException("Invalid muscle role")
        };
    }
}