# Chrome Copy

This Chrome extension adds a context menu item to copy a link to a page as HTML.
This is useful for pasting links to pages with a useful name rather than as a raw url.

## Installation

TODO

## Usage

### Selection mode

Select the text you want as the link text, right click and choose "Copy selection as link". This will create
an HTML link to the current page with the selected text and put it on the clipboard.

### Automatic mode

If no text is selected, you can right click and choose "Copy link to page". The extension will try and choose something
useful as the link text.

By default, it uses `document.title` as the link text. But there's special handling for:

* Github pull requests
* Linear issue pages
