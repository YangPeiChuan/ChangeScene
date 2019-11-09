/** @type {Map<string,MyVideo>} */
var fadeInVideos = new Map();

/** @type {Map<string,MyVideo>} */
var fadeOutVideos = new Map();

class MyVideo {

    //#region Field

    /** @type {MyVideo}*/
    Next = null;

    //#endregion 

    /**
     * 
     * @param {string} id
     * @param {string} type
     * @param {string} src
     * @param {string} fireKey
     * @param {boolean} isLoop
     * @param {number} fadeIn
     * @param {number} fadeOut
     * @param {boolean} autoplay
     */
    constructor(id, type, src, fireKey, isLoop, fadeIn = 1, fadeOut = 1, autoplay = false) {

        /** @type {number}*/
        this.Opacity = fadeIn === 1 ? 1 : 0;

        /** @type {number}*/
        this.FadeIn = fadeIn;

        /** @type {number}*/
        this.FadeOut = fadeOut;

        /** @type {string}*/
        this.ID = id;

        this.Type = type;

        this.CharCode = fireKey.length > 0 ? fireKey.charCodeAt(0) : null;

        let v = document.createElement("video");
        v.muted = true;
        v.autoplay = autoplay;
        v.loop = isLoop;
        v.src = src;
        v.style.opacity = this.Opacity;
        v.classList.add("fixPosition");

        switch (type) {
            case "BG": {
                v.id = `bg-${id}`;
                document.getElementById("bgContain").append(v);
                break;
            }
            case "Object": {
                v.id = `obj-${id}`;
                document.getElementById("objects").append(v);
                break;
            }
            default:
                alert(`ID(快捷鍵)${id}資料有誤`);
                break;
        }

        /** @type {HTMLVideoElement}*/
        this.Dom = v;
    }

    Fire() {
        if (this.Dom.paused || this.Dom.ended) {
            fadeInVideos.set(this.ID, this);
            this.Dom.hidden = false;
            this.Dom.play();

            if (fadeInVideos.size === 1)
                MyVideo._playFadeIn();
        }
        else {
            fadeOutVideos.set(this.ID, this);
            if (this.Next !== null)
                this.Next.Dom.play();
            if (fadeOutVideos.size === 1)
                MyVideo._playFadeOut();
        }
    }

    static _playFadeIn() {
        /** @type {MyVideo[]}*/
        var rmv = [];

        fadeInVideos.forEach(function (fadeInVideo) {
            if (fadeInVideo.Opacity === 1) {
                rmv.push(fadeInVideo);
                return;
            }
            fadeInVideo.Opacity = fadeInVideo.Opacity + fadeInVideo.FadeIn >= 1 ? 1 : fadeInVideo.Opacity + fadeInVideo.FadeIn;
            fadeInVideo.Dom.style.opacity = fadeInVideo.Opacity;
        });

        rmv.forEach(function (mv) {
            fadeInVideos.delete(mv.ID);
            if (mv.Type === "BG")
                mapper.delete(mv.CharCode);
        });

        if (fadeInVideos.size > 0)
            window.requestAnimationFrame(MyVideo._playFadeIn);
    }

    static _playFadeOut() {
        /** @type {MyVideo[]}*/
        var rmv = [];
        fadeOutVideos.forEach(function (fadeOutVideo) {

            if (fadeOutVideo.Opacity === 0 && (fadeOutVideo.Next === null || fadeOutVideo.Next.Opacity === 1)) {
                fadeOutVideo.Dom.pause();
                fadeOutVideo.Dom.hidden = true;
                fadeOutVideo.Dom.currentTime = 0;
                rmv.push(fadeOutVideo);
                return;
            }

            if (fadeOutVideo.Opacity !== 0) {
                fadeOutVideo.Opacity = fadeOutVideo.Opacity - fadeOutVideo.FadeOut <= 0 ? 0 : fadeOutVideo.Opacity - fadeOutVideo.FadeOut;
                fadeOutVideo.Dom.style.opacity = fadeOutVideo.Opacity;
            }

            if (fadeOutVideo.Next !== null && fadeOutVideo.Next.Opacity === 1) {
                fadeOutVideo.Next.Opacity = fadeOutVideo.Next.Opacity + fadeOutVideo.Next.FadeIn >= 1 ? 1 : fadeOutVideo.Next.Opacity + fadeOutVideo.Next.FadeIn;
                fadeOutVideo.Next.Dom.style.opacity = fadeOutVideo.Next.Opacity;
            }
        });

        rmv.forEach(function (mv) {
            fadeOutVideos.delete(mv.ID);
            if (mv.Type === "BG")
                mapper.delete(mv.CharCode);
        });

        if (fadeOutVideos.size > 0)
            window.requestAnimationFrame(MyVideo._playFadeOut);
    }
}

/** @type {Map<number,MyVideo>} */
var mapper = new Map();

loadCSV = function () {
    document.getElementById("loadCSVArea").hidden = true;
    var fileInput = document.getElementById("csv");
    var reader = new FileReader();
    reader.onload = function () {
        var rows = reader.result.split(/[\n]/);
        var isFirstBG = true;
        for (var i = 1; i < rows.length - 1; i++) {
            /** @type {string[]} */
            var columns = rows[i].split(/[,]/);
            var mv = new MyVideo(
                columns[0],
                columns[1],
                columns[2],
                columns[3],
                columns[6] === "TRUE",
                columns[4].length > 0 ? Number.parseFloat(columns[4]) : 1,
                columns[5].length > 0 ? Number.parseFloat(columns[5]) : 1,
                isFirstBG
            );
            if (mv.CharCode !== null) mapper.set(mv.CharCode, mv);

            if (columns[7].length > 0) {
                mapper.forEach(function (value, key, map) {
                    if (value.ID === columns[7]) {
                        value.Next = mv;
                        return;
                    }
                });

            }
            if (isFirstBG && columns[1] === "BG") isFirstBG = false;
        }
    };
    reader.readAsBinaryString(fileInput.files[0]);
    document.getElementById("bgContain").hidden = false;
    document.getElementById("objects").hidden = false;
};

vedioControl = function (keyCode) {
    if (keyCode === 123) return;
    if (mapper.has(keyCode)) {
        mapper.get(keyCode).Fire();
    }
};