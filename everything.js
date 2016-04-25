var yt_key = "AIzaSyDf0NS5Pzvra51I3nzDsjTzLUVzqIrcbJU";
var oauth2_client = "1086911666386-a83cmtgp50komi85mtdc2agued35e7bn.apps.googleusercontent.com";

function euc(s) {
    return encodeURIComponent(s);
}

function auth() {
    var redirect_uri = window.location.href;
    var path = window.location.path;
    if (path.length > 0 && path[path.length - 1] === "/") {
        redirect_uri = redirect_uri.replace(window.location.path, path);
    }
    window.location.href = "https://accounts.google.com/o/oauth2/auth" + "?client_id=" + euc(oauth2_client) + "&response_type=token" + "&scope=" + euc("https://www.googleapis.com/auth/youtube.readonly") + "&mine=true" + "&redirect_uri=" + euc(redirect_uri);
}

function getChannelInfo(token, onData, onFail) {
    $.getJSON("https://www.googleapis.com/youtube/v3/channels", {
        key: yt_key,
        part: "contentDetails",
        mine: true,
        access_token: token
    }, onData).fail(onFail);
}

function watchLater(token, watchLaterID, page, onData, onFail) {
    var args = {
        key: yt_key,
        part: "snippet",
        maxResults: 50,
        playlistId: watchLaterID,
        access_token: token
    };

    if (page) {
        args.pageToken = page;
    }

    $.getJSON("https://www.googleapis.com/youtube/v3/playlistItems", args, onData).fail(onFail);
}