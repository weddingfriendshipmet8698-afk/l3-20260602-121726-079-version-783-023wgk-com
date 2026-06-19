var hlsPromise = null;
var hlsScriptUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";

function loadHlsLibrary() {
    if (window.Hls) {
        return Promise.resolve(window.Hls);
    }
    if (hlsPromise) {
        return hlsPromise;
    }
    hlsPromise = new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.src = hlsScriptUrl;
        script.async = true;
        script.onload = function () {
            if (window.Hls) {
                resolve(window.Hls);
            } else {
                reject(new Error("HLS library loaded without global Hls"));
            }
        };
        script.onerror = function () {
            reject(new Error("Unable to load HLS library"));
        };
        document.head.appendChild(script);
    });
    return hlsPromise;
}

function setupPlayer(card) {
    var video = card.querySelector("video");
    var button = card.querySelector("[data-play-button]");
    var status = card.querySelector("[data-player-status]");
    var primarySource = card.dataset.primarySource;
    var fallbackSource = card.dataset.fallbackSource;
    var hlsInstance = null;
    var triedFallback = false;

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function hideButton() {
        if (button) {
            button.classList.add("is-hidden");
        }
    }

    function playNative(source) {
        video.src = source;
        video.addEventListener("error", function () {
            if (!triedFallback && fallbackSource && source !== fallbackSource) {
                triedFallback = true;
                setStatus("正在切换备用播放源...");
                playSource(fallbackSource);
            }
        }, { once: true });
        return video.play();
    }

    function playWithHls(Hls, source) {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
        hlsInstance = new Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play();
        });
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && !triedFallback && fallbackSource && source !== fallbackSource) {
                triedFallback = true;
                setStatus("正在切换备用播放源...");
                playSource(fallbackSource);
            }
        });
    }

    function playSource(source) {
        hideButton();
        setStatus("正在加载播放源...");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            playNative(source).then(function () {
                setStatus("正在播放");
            }).catch(function () {
                setStatus("浏览器阻止了自动播放，请再次点击视频播放。\n");
            });
            return;
        }
        loadHlsLibrary().then(function (Hls) {
            if (Hls.isSupported()) {
                playWithHls(Hls, source);
                setStatus("正在播放");
            } else {
                setStatus("当前浏览器不支持 HLS 播放。请更换浏览器或提供 MP4 源。");
            }
        }).catch(function () {
            setStatus("播放器组件加载失败，请检查网络后重试。");
        });
    }

    if (!video || !button) {
        return;
    }

    button.addEventListener("click", function () {
        triedFallback = false;
        playSource(primarySource || fallbackSource);
    });
}

document.querySelectorAll("[data-player]").forEach(setupPlayer);
