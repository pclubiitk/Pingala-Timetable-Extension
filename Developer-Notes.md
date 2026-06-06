1. For creating the zip, for submitting it over the web store.
```
rm extension.zip && zip -r extension.zip . -x ".*" "*.git*" "*.zip"
```

2. Image generation
```
cd /Users/this_is_mjk/Projects/Pclub/Pingala-Timetable-Extension/icons && sips -z 128 128 pclub.png --out pclub-128.png && sips -z 48 48 pclub.png --out pclub-48.png && sips -z 32 32 pclub.png --out pclub-32.png && sips -z 16 16 pclub.png --out pclub-16.png
```
