Output output/demo.gif

Set Theme { "name": "Cyberpunk", "black": "#0D0221", "red": "#FF006E", "green": "#39FF14", "yellow": "#FFE600", "blue": "#00D4FF", "purple": "#FF00FF", "cyan": "#00FFFF", "white": "#E0E0E0", "brightBlack": "#555577", "brightRed": "#FF4D9D", "brightGreen": "#69FF47", "brightYellow": "#FFE600", "brightBlue": "#4CC9F0", "brightPurple": "#F72585", "brightCyan": "#4CC9F0", "brightWhite": "#FFFFFF", "background": "#0D0221", "foreground": "#00FFFF", "cursor": "#FF00FF", "selectionBackground": "#FF006E" }

Set FontSize 14
Set Width 1200
Set Height 700
Set Padding 20

# Rounded corners + neon glow border
# Outer canvas is near-black to feel transparent
# MarginFill gives the neon border strip between canvas and terminal
Set BorderRadius 16
Set WindowBar Colorful
Set Margin 10
Set MarginFill "#9D00FF"

Sleep 500ms

# 1. explain — wait long enough for AI to respond before typing b
Type `clix explain "find . -name '*.log' -mtime +30"`
Enter
Sleep 14s

# press b for beginner mode (stdin is in raw mode, no Enter needed)
Type "b"
Sleep 10s

# 2. generate
Type `clix generate "kill the process running on port 3000"`
Enter
Sleep 8s

# 3. save
Type `clix save "lsof -i :3000" --tag networking --description "Find what is using a port"`
Enter
Sleep 2s

# 4. saved
Type `clix saved`
Enter
Sleep 3s

# 5. update — type new model, keep max tokens
Type `clix update`
Enter
Sleep 2s
Type "claude-haiku-4-5"
Enter
Sleep 1s
Enter
Sleep 3s
