const COPY_AS_HTML = "copy-as-html"
const COPY_SELECTION_AS_HTML = "copy-selection-as-html"

const GITHUB_RE = new RegExp('^https://github.com/(?<org>\\w+)/(?<repo>\\w+)/(pull|issues)/(?<number>\\d+)')
const LINEAR_RE = new RegExp('^https://linear.app/\\w+/issue/(?<issue>\\w+-\\d+)')

const IMPLIED_GITHUB_ORG = 'buildkite'

// WARNING: This function is run in the page context. It doesn't have access to external variables.
// Unfortunately you can't access the clipboard from the service worker context so we have to do it this way.
const copyAddressAsHTML = async (url, text) => {
    try {
        const clipboardItem = new ClipboardItem({
            "text/plain": new Blob([`${text} <${url}>`], { type: "text/plain" }),
            "text/html": new Blob([`<a href="${url}">${text}</a>`], { type: "text/html" })
        })
        await navigator.clipboard.write([clipboardItem])
        console.debug("Copied to clipboard")
    } catch(err) {
        console.warn(err)
    }
}

const onMenuClicked = async (info, tab) => {
    console.debug("item " + info.menuItemId + " was clicked")

    const url = info.pageUrl

    if (info.menuItemId === COPY_AS_HTML) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: copyAddressAsHTML,
            args: [url, defaultText(info, tab)]
        })
    } else if (info.menuItemId === COPY_SELECTION_AS_HTML) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: copyAddressAsHTML,
            args: [url, info.selectionText]
        })
    }
}

const defaultText = (info, tab) => {
    const url = info.pageUrl

    if (m = GITHUB_RE.exec(url)) {
        if (m.groups.org === IMPLIED_GITHUB_ORG) {
            return `${m.groups.repo}#${m.groups.number}`
        } else {
            return `${m.groups.org}/${m.groups.repo}#${m.groups.number}`
        }
    } else if (m = LINEAR_RE.exec(url)) {
        return m.groups.issue
    } else {
        return tab.title || ''
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
