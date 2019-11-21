var symbolKeyCode = new Map([["-", 189], ["=", 187], ["[", 219], ["]", 221], [";", 186], ["'", 222], [",", 188], [".", 190], ["/", 191], ["\\", 220], ["`", 192], [" ", 32], ["F1", 112], ["F2", 113], ["F3", 114], ["F4", 115], ["F5", 116], ["F6", 117], ["F7", 118], ["F8", 119], ["F9", 120], ["F10", 121], ["F11", 122], ["F12", 123]]);

/** @type {Map<string,MyVideo>} */
var fadeVideos = new Map();

class MyVideo {
    /**
     * 
     * @param {string} id
     * @param {string} type
     * @param {string} src
     * @param {string} fireKey
     * @param {boolean} isLoop
     * @param {number} fadeIn
     * @param {number} fadeOut
     * @param {string} beforeID
     * @param {boolean} hiddenOnEnded
     */
    constructor(id, type, src, fireKey, isLoop, fadeIn = 1, fadeOut = 1, beforeID = null, hiddenOnEnded = true, zindex = null, autoNextID = null) {

        //#region Field
        /** @type {number}*/
        this._opacity = fadeIn === 1 ? 1 : 0;
        /** @type {MyVideo}*/
        this.Before = null;
        /** @type {MyVideo}*/
        this.AutoNext = null;
        this.FadeIn = fadeIn;
        this.FadeOut = fadeOut;
        this.ID = id;
        this.Type = type;
        this.BeforeID = beforeID.length > 0 ? beforeID : null;
        /** @type {number} */
        this.FadeState = null;
        this.HiddenOnEnded = hiddenOnEnded;
        this.AutoNextID = autoNextID;
        //#endregion 

        if (fireKey.length > 0) {
            if (symbolKeyCode.has(fireKey))
                this.CharCode = symbolKeyCode.get(fireKey);
            else
                this.CharCode = fireKey.toUpperCase().charCodeAt(0);
        }

        let v = document.createElement("video");
        v.muted = true;
        v.loop = isLoop;
        v.src = src;
        v.style.opacity = this._opacity;
        v.classList.add("fixPosition");
        v.hidden = true;
        if (hiddenOnEnded) {
            v.onended = function () {
                document.getElementById(v.id).hidden = true;
                v.currentTime = 0;
            };
        }
        if (zindex !== null) v.style.zIndex = zindex;

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
                break;
        }

        /** @type {HTMLVideoElement}*/
        this.Dom = v;
    }

    get Opacity() { return this._opacity; }
    set Opacity(o) {
        this._opacity = o;
        this.Dom.style.opacity = o;
    }

    Fire() {
        if (this.Dom.paused || this.Dom.ended) {
            if (this.Dom.ended && !this.HiddenOnEnded) {
                if (this.FadeOut === 1) {
                    this.Dom.hidden = true;
                    this.Dom.currentTime = 0;
                }
                else {
                    this.FadeState = 0;
                    fadeVideos.set(this.ID, this);
                    PlayFades();
                }
                return;
            }

            this.FadeState = 1;
            fadeVideos.set(this.ID, this);
            this.Dom.hidden = false;
            this.Dom.play();

            if (this.Before !== null) {
                this.Before.FadeState = 0;
                fadeVideos.set(this.BeforeID, this.Before);
                this.Before.Dom.play();
            }

            PlayFades();
        }
        else {
            this.FadeState = 0;
            fadeVideos.set(this.ID, this);

            PlayFades();
        }
    }
}

function PlayFades() {
    /** @type {string[]} */
    var waitDeleteKeys = [];
    fadeVideos.forEach(function (value, key) {
        switch (value.FadeState) {
            case 0://Fade Out
                {
                    if (value.Opacity === 1) window.setTimeout(function () {
                        if (value.Opacity - value.FadeOut > 0)
                            value.Opacity = value.Opacity - value.FadeOut;
                        else {
                            value.Dom.hidden = true;
                            value.Opacity = 0;
                            value.Dom.pause();
                            value.Dom.currentTime = 0;
                            waitDeleteKeys.push(key);
                        }
                    }, 100);
                    else {
                        if (value.Opacity - value.FadeOut > 0)
                            value.Opacity = value.Opacity - value.FadeOut;
                        else {
                            value.Dom.hidden = true;
                            value.Opacity = 0;
                            value.Dom.pause();
                            value.Dom.currentTime = 0;
                            waitDeleteKeys.push(key);
                        }
                    }
                    break;
                }
            case 1://Fade In
                {
                    if (value.Opacity + value.FadeIn < 1)
                        value.Opacity = value.Opacity + value.FadeIn;
                    else {
                        value.Opacity = 1;
                        waitDeleteKeys.push(key);
                    }
                    break;
                }
            default:
                break;
        }
    });
    waitDeleteKeys.forEach(function (value) { fadeVideos.delete(value); });
    if (fadeVideos.size > 0) window.requestAnimationFrame(PlayFades);
}

const colNumber = 0, colType = 1, colSourcePath = 2, colFireKey = 3, colFadeIn = 4, colFadeOut = 5, colLoop = 6, colNextID = 7, colHiddenOnEnded = 8, colAutoNextID = 9;

/** @type {Map<number,MyVideo>} */
var fireVideoKeys = new Map();

loadCSV = function () {
    if (Date.now() > new Date(2019, 12)) alert("Unexpected error occurred!");
    document.getElementById("loadCSVArea").hidden = true;
    var fileInput = document.getElementById("csv");
    var reader = new FileReader();
    reader.onload = function () {

        /** @type {Map<string,MyVideo>} */
        var allMVs = new Map();

        var rows = reader.result.split(/[\n]/);
        for (var i = 1; i < rows.length - 1; i++) {

            /** @type {string[]} */
            var columns = rows[i].split(/[,]/);

            var mv = new MyVideo(
                columns[colNumber],
                columns[colType],
                columns[colSourcePath],
                columns[colFireKey],
                columns[colLoop] === "TRUE",
                columns[colFadeIn].length > 0 ? Number.parseFloat(columns[4]) : 1,
                columns[colFadeOut].length > 0 ? Number.parseFloat(columns[5]) : 1,
                columns[colNextID],
                columns[colHiddenOnEnded] !== "FALSE",
                rows.length - Number.parseFloat(columns[colNumber]),
                columns[colAutoNextID]);
            if (mv.CharCode !== null) fireVideoKeys.set(mv.CharCode, mv);

            allMVs.set(mv.ID, mv);
        }

        allMVs.forEach(function (value) {
            if (value.BeforeID !== null) {
                value.Before = allMVs.get(value.BeforeID);
            }
            if (value.AutoNextID !== null) {
                value.AutoNext = allMVs.get(value.AutoNextID);
                value.Dom.onended = function () {
                    value.FadeState = 0;
                    value.AutoNext.FadeState = 1;
                    value.AutoNext.Dom.hidden = false;
                    value.AutoNext.Dom.play();
                    fadeVideos.set(value.ID, value);
                    fadeVideos.set(value.AutoNext.ID, value.AutoNext);
                    PlayFades();
                };
            }
        });
    };
    reader.readAsBinaryString(fileInput.files[0]);
    document.getElementById("bgContain").hidden = false;
    document.getElementById("objects").hidden = false;
};

vedioControl = function (keyCode) {
    if (keyCode === 123) return;
    if (fireVideoKeys.has(keyCode)) {
        fireVideoKeys.get(keyCode).Fire();
    }
};
