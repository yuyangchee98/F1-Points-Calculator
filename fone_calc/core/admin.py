from django.contrib import admin
from .models import Season, Team, Driver, DriverSeason, Race, RaceResult, PointSystem, Championship

# Register your models here.

# admin.py

@admin.register(Season)
class SeasonAdmin(admin.ModelAdmin):
    list_display = ('year', 'name')
    search_fields = ('year', 'name')

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'active')
    list_filter = ('active',)
    search_fields = ('name',)

@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ('name', 'active')
    list_filter = ('active',)
    search_fields = ('name',)

@admin.register(DriverSeason)
class DriverSeasonAdmin(admin.ModelAdmin):
    list_display = ('driver', 'season', 'team')
    list_filter = ('season', 'team')
    search_fields = ('driver__name', 'team__name')

@admin.register(Race)
class RaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'season', 'round', 'date', 'circuit')
    list_filter = ('season',)
    search_fields = ('name', 'circuit')

@admin.register(RaceResult)
class RaceResultAdmin(admin.ModelAdmin):
    list_display = ('race', 'driver_season', 'finishing_position', 'points', 'fastest_lap', 'sprint_race_position', 'sprint_race_points')
    list_filter = ('race__season', 'fastest_lap')
    search_fields = ('race__name', 'driver_season__driver__name')

@admin.register(PointSystem)
class PointSystemAdmin(admin.ModelAdmin):
    list_display = ('season', 'position', 'points', 'is_sprint')
    list_filter = ('season', 'is_sprint')

@admin.register(Championship)
class ChampionshipAdmin(admin.ModelAdmin):
    list_display = ('season', 'driver', 'points', 'position')
    list_filter = ('season',)
    search_fields = ('driver__name',)