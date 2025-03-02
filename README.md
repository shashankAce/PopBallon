# Pop ballon

# Game Setup
    Downlaod the game from git 
    
    Install cocos dashboard and intall cocos creator engine version 2.4.14
    Import the project
    In the assets/Scene directory open the scene ballgame

    Hit the play button on top and play game on pc browser

# Calculating Tragectory

        vx = Math.cos(angleRad) * velocity;
        vy = Math.sin(angleRad) * velocity;

        x = vx * cos(angle) * t
        y = vy * sin(angle) * t - ( gravity * t^2 ) / 2 
