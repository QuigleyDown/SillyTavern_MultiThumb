# SillyTavern SillyTavern-MultiThumb Extension

**SillyTavern-MultiThumb** is a SillyTavern extension designed specifically for **multi-character cards**. It allows you to display multiple character avatars in a vertical row next to messages, replacing the singular thumbnail with a gallery of all characters tied to that card.

## Features

- **Multi-Character Support**: Displays the default character avatar followed by all images found in the character's **Gallery**.
- **Vertical Gallery**: Replaces the single message avatar with a vertical row of thumbnails, ensuring every character in a group card is represented.
- **Theme Compatibility**: 
    - **Default ST**: Works with Flat, Bubble, and Document layouts.
    - **Moonlit Echoes**: Specifically detects and adapts to "Echo", "Ripple", and "Bubble" styles. It automatically hides the theme's background avatars in Echo mode to prevent visual clutter.
- **Portrait Support**: Uses a 2:3 aspect ratio for thumbnails to match modern portrait-style character cards.
- **Dynamic Loading**: Automatically processes new messages as they arrive.
- **RTL Support**: Correctly positions thumbnails for user messages in bubble/chat modes.

## Installation

1.  **Locate your SillyTavern Directory**: Navigate to the folder where SillyTavern is installed on your machine.
2.  **Copy the Extension**: Move the `multithumbs` folder into the following directory:
    ```text
    SillyTavern/public/scripts/extensions/third-party/
    ```
3.  **Refresh SillyTavern**: Reload your browser tab running SillyTavern.
4.  **Enable the Extension**:
    - Click the **Extensions** icon (puzzle piece) in the top bar.
    - Find **SillyTavern-MultiThumb** in the list and ensure it is enabled.

## Requirements

- **SillyTavern**: Version 1.12.0 or higher is recommended.
- **Character Gallery**: To display multiple characters, place additional character images in the character's gallery folder.
    - Path: `SillyTavern/data/default-user/user/images/[Character Name]/`
    - You can also add images by clicking the "More..." menu on a character card and selecting **"Show Gallery"**, then uploading images there.

## Configuration & Usage

The extension works automatically. Once enabled, any message from a character with gallery images will show the thumbnail gallery.

- **Default Avatar**: The primary character card image is always displayed as the first thumbnail.
- **Gallery Images**: Any images in the character's gallery are appended after the default avatar.
- **Scrolling**: If a card has many characters, you can scroll vertically within the thumbnail area.
- **Hover**: Hover over a character's thumbnail to see it slightly enlarge.
- **Theme Matching**: If you are using **Moonlit Echoes**, the thumbnails will automatically adopt the theme's aesthetic, including rounded corners and appropriate positioning.

## Developers

Created by **Gemini CLI** as a demonstration of a cross-theme compatible SillyTavern extension.

## License

MIT
