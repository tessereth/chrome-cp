const COPY_AS_HTML = "copy-as-html"
const COPY_SELECTION_AS_HTML = "copy-selection-as-html"

// WARNING: This is run in the page context. It doesn't have access to external variables.
const copyAddressAsHTML = async (url, text) => {
    const GITHUB_RE = new RegExp('^https://github.com/buildkite/(\\w+)/pull/(\\d+)')
    const LINEAR_RE = new RegExp('^https://linear.app/buildkite/issue/(\\w+-\\d+)')

    try {
        if (!text) {
            if (m = GITHUB_RE.exec(url)) {
                text = `${m[1]}#${m[2]}`
            } else if (m = LINEAR_RE.exec(url)) {
                text = m[1]
            } else {
                text = document.title
            }
        }

        const clipboardItem = new ClipboardItem({
            "text/plain": new Blob([`${text} <${url}>`], { type: "text/plain" }),
            "text/html": new Blob([`<a href="${url}">${text}</a>`], { type: "text/html" })
        })
        await navigator.clipboard.write([clipboardItem])
        console.log("Copied to clipboard")
    } catch(err) {
        console.warn(err)
    }
}

const onMenuClicked = async (info, tab) => {
    console.log("item " + info.menuItemId + " was clicked")

    const url = info.pageUrl

    if (info.menuItemId === COPY_AS_HTML) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: copyAddressAsHTML,
            args: [url]
        })
    } else if (info.menuItemId === COPY_SELECTION_AS_HTML) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: copyAddressAsHTML,
            args: [url, info.selectionText]
        })
    }
}

chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        "title": "Copy link to page",
        "id": COPY_AS_HTML,
        "contexts": ["page"]
    })

    chrome.contextMenus.create({
        "title": "Copy selection as link",
        "id": COPY_SELECTION_AS_HTML,
        "contexts": ["selection"]
    })

    chrome.contextMenus.onClicked.addListener(
        onMenuClicked
    )
})