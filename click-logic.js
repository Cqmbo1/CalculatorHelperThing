// 1. Fetch Y2Mate base URL from GitHub
// (Tip: You could also hardcode this here now, since this file itself updates!)
let baseUrl = "https://y2mate.hair/y2mate/?query=";
let encode = true;
/*
try {
    // Keeping your original baseline fetch, though you could optimize this later
    const res = await fetch("https://raw.githubusercontent.com/Cqmbo1/CalculatorHelperThing/refs/heads/main/Link");
    baseUrl = (await res.text()).trim();
} catch (e) {
    alert("Couldn't load Y2Mate link from GitHub.");
    return;
}
*/

// 2. Fix YouTube Shorts → Watch
let currentUrl = window.location.href;

if (currentUrl.includes("/shorts/")) {
    currentUrl = currentUrl.replace("/shorts/", "/watch?v=");
}

let videoId;
if (!encode) {
const CutURL = new URLSearchParams(new URL(currentUrl).search);
//const videoId = CutURL.get("v");
  videoId = CutURL.get("v");

if (!videoId) {
    alert("No video ID found in the URL.");
    return;
}
} else {
videoId = encodeURIComponent(currentUrl);
}

// 3. Open new Y2Mate window using GitHub-configured base URL
window.open(
    `${baseUrl}${videoId}`,
    "popUpWindow",
    "height=800,width=1000,left=50%,top=100,resizable=no,scrollbars=yes,toolbar=no,menubar=yes,location=no,directories=yes,status=no"
);
