Project scope

I am creating a F1 related application to calculate total points at the end of the year with these key features:
    - Django-based backend with models for F1 seasons, races, drivers, teams, and results.
    - Automatic calculation of driver points and championship standings.
    - Drag-and-drop interface for modifying race results.
    - Real-time recalculation of points and standings based on user changes.
    - Allow "what-if" scenarios are handled through the drag-and-drop interface

Guide the user through building this web application:
DONE Set up the Django project and configure the database.
DONE Implement the models and migrations.
DONE Create Django admin interfaces for data management.
TODO Develop API endpoints for frontend interaction, focusing on updating race results. I want to be able to store the "state" of the table (for the user) in the url, so that each user can share the link and shows others the table that they have just created via drag and drop. 
TODO Design and implement the frontend with a drag-and-drop interface.
TODO Implement real-time calculations and updates triggered by drag-and-drop actions.
TODO Create views for displaying standings that update in real-time.
TODO Test and deploy the application.

Provide detailed, beginner-friendly explanations throughout the process. Focus on how to implement the drag-and-drop functionality that allows users to explore different race outcomes and see immediate updates to points and standings.

Requirements: do not use react. use htmx, use css grid. 