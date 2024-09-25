Overview
runner is a browser-based side-scrolling game inspired by the offline dinosaur game in Google Chrome. Players control a character that can jump over obstacles, with the goal of surviving as long as possible.

Features

Two Game Modes:
Marathon Mode: Continuous play with consistent difficulty
Challenge Mode: Escalating difficulty for an increasing challenge


Responsive Design: Adapts to different screen sizes for consistent gameplay experience
High Score Tracking: Separate high scores for each game mode, stored locally in the browser
Simple, Engaging Gameplay: One-button control (spacebar) for jumping

How to Play

Open the game in a web browser
Choose between Marathon and Challenge mode
Press spacebar to make your character jump over obstacles
Survive as long as possible to achieve a high score

Technical Details
Tech Stack

HTML5 (Canvas for game rendering)
CSS3
Vanilla JavaScript

Project Structure

index.html: Main HTML file with game canvas and UI elements
styles.css: Styling for the game UI
main.js: Core game logic and rendering

Key Components

Game Constants: Base dimensions, physics parameters, game object sizes
Character Object: Manages player character properties and methods
Obstacles Object: Handles obstacle generation, updates, and rendering
Game Loop: Core update and render cycle
Scaling System: Maintains consistent gameplay across different screen sizes

Responsive Design
Base dimensions: 800x400 pixels
Scaling factors used to adapt to various screen sizes

Project Structure Choices
Vanilla Web Technologies Approach
This project embraces the power and flexibility of core web technologies - HTML, CSS, and JavaScript - to create a responsive game without relying on external frameworks, game engines, or build tools. This approach offers several advantages:

Simplicity: The project remains lightweight and free from dependency management.
Learning Opportunity: This project uses the most barebones tools in order to tackle more tertiary problems involved with approaching a game like this with a high degree of granular control.
Performance: By avoiding heavy libraries, the game can achieve better performance across more device types in a wider variety of environments and browsers. 

Complexities and Challenges
Despite the seemingly simple tech stack, this project tackles several challenges:

Game Loop Implementation: Creating a stable and efficient game loop in JavaScript, handling updates and rendering at appropriate intervals.
Physics Simulation: Implementing jumping mechanics and collision detection without a physics engine, requiring careful timing and math calculations.
Responsive Design: Scaling the game appropriately across different screen sizes while maintaining consistent gameplay, involving separate calculations and CSS techniques.
Canvas Rendering: Utilizing the HTML5 Canvas API for all game graphics, requiring low-level drawing operations and optimization techniques.
Timing and Synchronization: Managing game speed, obstacle generation, and scoring in a way that remains consistent across different devices and frame rates.
Cross-Browser Compatibility: Ensuring the game runs smoothly across different browsers without the use of transpilation or polyfill libraries.


Current Challenges and Future Improvements
Challenges

Balancing Difficulty: Ensuring the game is challenging but fair across different skill levels
Performance Optimization: Improving efficiency, especially for mobile devices
Collision Detection: Fine-tuning collisions for various object types to be as accurate as possible

Planned Improvements

Implementing more distinct and unique gameplay for Challenge mode
Adding visual assets to replace geometric shapes
Optimizing performance for mobile devices