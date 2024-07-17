20240709
    - Added changelog feature
    - Added new feature that allows users to create a changelog.
    - Updated dependencies to latest versions.
    - Fixed issue where the application crashed on startup.
    - Initial release.
    - Reverse numbering
    - Center the image grid
    - Removed the padding feature
    - Install the Arial font
    - Make a mark in image's preview that starts the numbering from click position

20240710
    - Created a mark in the click position in image preview, where the numbering will start from
    - Fixed the position of the numbering to match exactly where the user click and match with the mark
    - Add an exception to the "Page" mode to dont calculate the mouse position (bug fixed)
    - Added a zoom feature to the image preview
    - Fixed the mark for numbering to be in the click point on the image, no matter how much the zoom level is
    - When uploaded an image, is in that level that is visible in the preview window
    - Fixed the preview window to be in widht = 595px (actually auto) and height = 600px (based on golden ratio)
    - I limit the mouse wheel zoom to be done only with the control key on windows and command on mac
    - Zoom button controls added to the image preview window
    - The green mark for numbering works only on numbering mode
    - If the user place a green mark and choose again page mode, it clears the mark (bug fixed)

20240711
    - Made the form inputs with legends on top and made them all to have same width
    - Added icons on some of them
    - Various ux changes

20240712
    - Refactor all the ux by make it in grid for simplified ux
    - Refactor the stucture of the html and the position of a lot of items

20240713
    - Refine the ux
    - Added the pdf preview window
    - Make the settings static because previous was resetting after submit
    - Started to separate the javascript file to smaller files for better maintainability

20240716
    - Javascript files separation completed
    - Moved the logo beside of upload button
    - Moved the mode form beside in the basic action container for best groupping
    - Group some same divs for easier style
    - Group but separate buttons for diffent style
    - Redesign the logo and button places
    - Fixed the page size to be one full page
    - Made the custom fieldgroups hidden when dont needed for simpler ux
    - Made some space to fields to be easier to scan by one sight
    - Draft redesign the color of the main buttons to separate them visually
    - Seperate the event-handlers.js to smaller files for easier maintenance
    - Created a button that adds white boxes in the uploaded image (for now is not written in pdf)
    - Fixed the green mark and the white boxes to show together
