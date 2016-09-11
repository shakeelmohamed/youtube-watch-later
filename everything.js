var yt_key = "AIzaSyDf0NS5Pzvra51I3nzDsjTzLUVzqIrcbJU";
var oauth2_client = "1086911666386-a83cmtgp50komi85mtdc2agued35e7bn.apps.googleusercontent.com";

function euc(s) {
    return encodeURIComponent(s);
}

function auth() {
    // var redirect_uri = window.location.href;
    var redirect_uri = "http://shakeelmohamed.com/youtube-watch-later/";
    var path = window.location.pathname;
    // if (path.length > 0 && path[path.length - 1] === "/") {
    //     redirect_uri = redirect_uri.replace(window.location.pathname, path);
    // }
    window.location.href = "https://accounts.google.com/o/oauth2/auth" + "?client_id=" + euc(oauth2_client) + "&response_type=token" + "&scope=" + euc("https://www.googleapis.com/auth/youtube.readonly") + "&mine=true" + "&redirect_uri=" + (redirect_uri);
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


$(function() {
    if (window.location.href.indexOf("access_token") > 0) {
        var hash = window.location.hash;
        var regex = new RegExp("access_token=.*?&");
        var token = regex.exec(hash)[0].replace("&", "").replace("access_token=", "");
        console.log("token", token);

        function onError(err) {
            console.log("err");
            console.log(err);

            // TODO: prevent refresh loop by using sessionStorage
            // The token likely expired, refresh
            if (err.responseJSON &&
                err.responseJSON.error &&
                err.responseJSON.error.code === 401 &&
                window.location.href.indexOf("#") !== -1
                ) {
                window.location.hash = "";
                window.location.href = window.location.href.replace("/#", "");
            }
        }

        var watchLaterPlaylistID;
        var count = 1;
        function onWatchLaterSuccess(data) {
            console.log(data);
            if (data.items) {
                
                for (var di in data.items) {
                    var item = data.items[di].snippet;
                    var videoID = item.resourceId.videoId;
                    var thumbURL = (item.thumbnails && item.thumbnails.default) ? item.thumbnails.default.url : "";

                    // Skip private videos, TODO: handle removed videos
                    if (thumbURL === "" && item.title.toLowerCase() === "private video") {
                        continue;
                    }

                    var out = "";
                    out += "<a target=\"_blank\" href=\"https://www.youtube.com/watch?v=" + videoID + "\">" + "<img src=\"" + thumbURL + "\"><br>";
                    out += count++;
                    out += " &nbsp; " + item.title + "</a>";
                    out += " --- ";
                    out += "<a target=\"_blank\" href=\"https://zenplayer.audio?v=" + videoID + "\">" + "Zen Audio Player" + "</a>";
                    $("<li>" + out + "</li>").appendTo("#list");
                }
            }
            if (data.nextPageToken) {
                watchLater(token, watchLaterPlaylistID, data.nextPageToken, onWatchLaterSuccess, onError);
            }
        }

        if (token) {
            getChannelInfo(
                token,
                function(data) {
                    console.log(data);
                    watchLaterPlaylistID = data.items[0].contentDetails.relatedPlaylists.watchLater;
                    watchLater(token, watchLaterPlaylistID, null, onWatchLaterSuccess, onError);
                },
                onError
            );
        }
    }
    else {
        // If URL ends in /# prevent hitting the Google auth 400 page
        window.location.href = window.location.href.replace("/#", "/");
        auth();
    }
});
