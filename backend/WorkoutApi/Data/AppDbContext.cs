using Microsoft.EntityFrameworkCore;
using WorkoutApi.Models;

namespace WorkoutApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    
    public DbSet<Exercise> Exercises => Set<Exercise>();
    public DbSet<ExerciseMuscle> ExerciseMuscles => Set<ExerciseMuscle>();
    public DbSet<WorkoutDayTemplate> WorkoutDayTemplates => Set<WorkoutDayTemplate>();
    public DbSet<WorkoutDayTemplateExercise> WorkoutDayTemplateExercises => Set<WorkoutDayTemplateExercise>();
    public DbSet<ScheduledWorkout> ScheduledWorkouts => Set<ScheduledWorkout>();
    public DbSet<ScheduledWorkoutExercise> ScheduledWorkoutExercises => Set<ScheduledWorkoutExercise>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Exercise>(entity =>
        {
            entity.Property(x => x.Name).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<ExerciseMuscle>(entity =>
        {
            entity.Property(x => x.MuscleKey).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<WorkoutDayTemplate>(entity =>
        {
            entity.Property(x => x.Name).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<WorkoutDayTemplateExercise>(entity =>
        {
            entity.HasOne(x => x.WorkoutDayTemplate)
                .WithMany(x => x.Exercises)
                .HasForeignKey(x => x.WorkoutDayTemplateId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(x => x.Exercise)
                .WithMany()
                .HasForeignKey(x => x.ExerciseId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ScheduledWorkout>(entity =>
        {
            entity.HasOne(x => x.WorkoutDayTemplate)
                .WithMany()
                .HasForeignKey(x => x.WorkoutDayTemplateId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ScheduledWorkoutExercise>(entity =>
        {
            entity.HasOne(x => x.ScheduledWorkout)
                .WithMany(x => x.Exercises)
                .HasForeignKey(x => x.ScheduledWorkoutId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Exercise)
                .WithMany()
                .HasForeignKey(x => x.ExerciseId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
    
    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return await base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e is { Entity: WorkoutDayTemplate, State: EntityState.Added or EntityState.Modified });

        foreach (var entry in entries)
        {
            var entity = (WorkoutDayTemplate)entry.Entity;

            if (entry.State == EntityState.Added)
                entity.CreatedAt = DateTime.UtcNow;

            entity.UpdatedAt = DateTime.UtcNow;
        }
    }
}