from django.db import models
from django.db import models  # Import the models module from Django
from django.db.models import Sum  # Import Sum function for aggregation

'''
+--------+     +--------------+     +-------+
| Season |<----| DriverSeason |---->| Driver|
+--------+     +--------------+     +-------+
    ^               ^    ^              ^
    |               |    |              |
    |               |    |              |
    v               |    |              v
+--------+          |    |         +-----------+
|  Race  |          |    |         |Championship|
+--------+          |    |         +-----------+
    ^               |    |
    |               |    |
    v               v    v
+------------+     +------+
| RaceResult |<----| Team |
+------------+     +------+
    ^
    |
    v
+-------------+
| PointSystem |
+-------------+

Legend:
<---- : One-to-Many relationship
<===> : Many-to-Many relationship

Explanation:
1. A Season has many Races and DriverSeasons.
2. A Driver can participate in multiple DriverSeasons.
3. A Team can have multiple DriverSeasons.
4. A DriverSeason represents a Driver racing for a Team in a specific Season.
5. A Race belongs to a Season and has many RaceResults.
6. A RaceResult links a Race with a DriverSeason and records the result.
7. PointSystem defines the points awarded for each position in a Season.
8. Championship tracks the overall standings for each Driver in a Season.

This structure allows you to:
- Track which drivers raced for which teams in each season
- Record the results of each race
- Calculate points based on the specific point system for each season
- Keep track of championship standings
'''

class Season(models.Model):
    # Store the year of the season (e.g., 2023)
    year = models.IntegerField(unique=True)  # Each year can only appear once
    # Store the name of the season (e.g., "2023 Formula 1 World Championship")
    name = models.CharField(max_length=100)  # Limit name to 100 characters

    def __str__(self):
        # When we print this object, show the name
        return self.name

class Team(models.Model):
    # Store the name of the team (e.g., "Mercedes", "Red Bull")
    name = models.CharField(max_length=100)  # Limit name to 100 characters
    # Indicate if the team is currently active
    active = models.BooleanField(default=True)  # New teams are active by default

    def __str__(self):
        # When we print this object, show the team name
        return self.name

class Driver(models.Model):
    # Store the name of the driver (e.g., "Lewis Hamilton")
    name = models.CharField(max_length=100)  # Limit name to 100 characters
    # Indicate if the driver is currently active
    active = models.BooleanField(default=True)  # New drivers are active by default

    def __str__(self):
        # When we print this object, show the driver's name
        return self.name

    def total_points(self, season):
        # Calculate total points for this driver in a specific season
        return RaceResult.objects.filter(
            driver_season__driver=self,  # Find results for this driver
            driver_season__season=season  # In the specified season
        ).aggregate(
            # Sum up main race points and sprint race points
            total=Sum('points') + Sum('sprint_race_points')
        )['total'] or 0  # Return 0 if no points (instead of None)

class DriverSeason(models.Model):
    # Link to the Driver model (who is driving)
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE)
    # Link to the Season model (which season)
    season = models.ForeignKey(Season, on_delete=models.CASCADE)
    # Link to the Team model (which team they're driving for)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)

    class Meta:
        # Ensure each driver-season-team combination is unique
        unique_together = ('driver', 'season', 'team')

    def __str__(self):
        # When we print this object, show driver, team, and year
        return f"{self.driver.name} - {self.team.name} ({self.season.year})"

    def total_points(self):
        # Calculate total points for this driver-season combination
        return RaceResult.objects.filter(
            driver_season=self  # Find all results for this driver-season
        ).aggregate(
            # Sum up main race points and sprint race points
            total=Sum('points') + Sum('sprint_race_points')
        )['total'] or 0  # Return 0 if no points (instead of None)

class Race(models.Model):
    # Link to the Season model (which season this race is part of)
    season = models.ForeignKey(Season, on_delete=models.CASCADE)
    # Store the round number of the race (e.g., 1 for first race of the season)
    round = models.IntegerField()
    # Store the name of the race (e.g., "British Grand Prix")
    name = models.CharField(max_length=100)  # Limit name to 100 characters
    # Store the date of the race
    date = models.DateField()
    # Store the name of the circuit (e.g., "Silverstone Circuit")
    circuit = models.CharField(max_length=100)  # Limit name to 100 characters

    class Meta:
        # Ensure each season-round combination is unique
        unique_together = ('season', 'round')

    def __str__(self):
        # When we print this object, show race name and year
        return f"{self.name} ({self.season.year})"

class RaceResult(models.Model):
    # Link to the Race model (which race this result is for)
    race = models.ForeignKey(Race, on_delete=models.CASCADE)
    # Link to the DriverSeason model (which driver-season this result is for)
    driver_season = models.ForeignKey(DriverSeason, on_delete=models.CASCADE)
    # Store the finishing position (e.g., 1 for first place)
    finishing_position = models.IntegerField()
    # Store the points earned in the main race
    points = models.FloatField()
    # Indicate if the driver had the fastest lap
    fastest_lap = models.BooleanField(default=False)
    # Store the finishing position in sprint race (if applicable)
    sprint_race_position = models.IntegerField(null=True, blank=True)
    # Store the points earned in sprint race (if applicable)
    sprint_race_points = models.FloatField(null=True, blank=True)

    class Meta:
        # Ensure each race-driver_season combination is unique
        unique_together = ('race', 'driver_season')

    def __str__(self):
        # When we print this object, show race, driver, and position
        return f"{self.race.name} - {self.driver_season.driver.name}: P{self.finishing_position}"

    def save(self, *args, **kwargs):
        # Automatically calculate points when saving the result
        # Get the points for the main race finishing position
        main_points = PointSystem.objects.get(
            season=self.race.season,
            position=self.finishing_position,
            is_sprint=False
        ).points
        # Add one point for fastest lap if in top 10
        self.points = main_points + (1 if self.fastest_lap and self.finishing_position <= 10 else 0)

        # Calculate sprint race points if applicable
        if self.sprint_race_position:
            sprint_points = PointSystem.objects.get(
                season=self.race.season,
                position=self.sprint_race_position,
                is_sprint=True
            ).points
            self.sprint_race_points = sprint_points

        # Call the original save method
        super().save(*args, **kwargs)

class PointSystem(models.Model):
    # Link to the Season model (which season this point system is for)
    season = models.ForeignKey(Season, on_delete=models.CASCADE)
    # Store the finishing position
    position = models.IntegerField()
    # Store the number of points for this position
    points = models.FloatField()
    # Indicate if this is for sprint race (True) or main race (False)
    is_sprint = models.BooleanField(default=False)

    class Meta:
        # Ensure each season-position-race_type combination is unique
        unique_together = ('season', 'position', 'is_sprint')

    def __str__(self):
        # When we print this object, show season, race type, position, and points
        race_type = "Sprint" if self.is_sprint else "Main"
        return f"{self.season.year} {race_type} Race - P{self.position}: {self.points} points"

class Championship(models.Model):
    # Link to the Season model (which season this championship standing is for)
    season = models.ForeignKey(Season, on_delete=models.CASCADE)
    # Link to the Driver model (which driver this standing is for)
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE)
    # Store the total points for this driver in this season
    points = models.FloatField(default=0)
    # Store the current championship position of this driver
    position = models.IntegerField()

    class Meta:
        # Ensure each season-driver combination is unique
        unique_together = ('season', 'driver')

    def __str__(self):
        # When we print this object, show season, driver, and position
        return f"{self.season.year} Championship - {self.driver.name}: P{self.position}"

    def update_points(self):
        # Update the points for this championship standing
        self.points = self.driver.total_points(self.season)
        # Save the changes
        self.save()

    @classmethod
    def update_positions(cls, season):
        # Get all championship standings for this season, ordered by points
        championships = cls.objects.filter(season=season).order_by('-points')
        # Update the position for each standing
        for position, championship in enumerate(championships, start=1):
            championship.position = position
            championship.save()