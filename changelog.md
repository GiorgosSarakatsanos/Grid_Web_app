# Changelog

All notable changes to this project will be documented in this file.

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

20240717
    - Rewrite the code for white boxes and now it works independet of zoom level or image position
    - Added a message on mouse that notifies the user for the zoom level
    - Now can move the image position when you press control in the keyboard and click and drag.
    - When you press control in the keyboard, a pop-up message in the mouse position shows and tell you that you can now drag and move the image

20240718
    - Now is not draw white boxes if not click the draw button first
    - When a right click made in a white box position, this box is selected and highlighted in red and opens a context menu in mouse position with the options to delete the selected box or to cancel the context menu option
    - Added a console output for boxes coordinates
    - Limited how small a white box can be, refusing to draw it.

20240720
    - Refactor the white box addition and bugs on its function
    - Debugging for mouse position and click on several functions

20240722
    - Refactor the image move and add boxes functions
    - Now draws boxes only when select the button, and can exit drawing by esc button.
    - In the print the boxes shown now, even if resize, move or delete them.
    - Replaced the selection input for the page mode selection, with a single button to switch between mode_numbering and mode_page
    - Add legend for image edits
    - Removed some console debugger messages

20240723
    - Refactor the green mark position and how it works with the addition of boxes

20240724
    - Added a button to add green mark position. When add a green mark, the page mode is automaticly switch to numbering mode.
    - If esc key hitted, then dont switch the mode to page. User have to change it
    - Added a button to add text
    - When clicks to add text, open a context menu with the options of move, rotate, resize, confim, cancel

20240725
    - When the display is less than 715px make the grid change positions for an easier to view ux
    - Fixed the set position to be exactly where it setted indepented of font size

20240726
    - Make a button to add text in canvas
    - Make the buttons, add text, add box and set numbering position to toggle between them

20240727
    - In a text input, the user can add what wants to add in canvas.
    - When user submit the text, a message warns to set the text position and when clicks on canvas set it (bug: adds it to the canvas double)
    - Right click now just open context menu. Previous worked as left mouse and could make draws or move.
    - When user resize the text, changes the font size by 1.
    - Now a border aroung text, inform the user there the corners is.
    - Toggle between edit button (buggy the draw box yet, but close to fixed)
    - Added an input selection to make text rotated before submitted ranging from -90 to +90 degrees with the default 0.
    - Added an input list that controls the font size before submitted in canvas

20240729
    - Separate the javascript files of box, text and numbering addition to smaller individual files for better maintainability
    -
20240802
    - Moved all the python code to one file, to reduse the problems i run. I move the code and delete the image_processing, corners, outlines files.
    - Moved all the imports to an init file

20240803
    - In the pdf file, fixed the font size to be the actual size in mm on paper (not yet the actual position)
    - Before the names of the produced images and pdf's was dependent of the filename. So i remove this function to dont create a lot of files in server. User can download the result and rename it i what name he wants. Maybe I'll add a button that renames the file before download it.
