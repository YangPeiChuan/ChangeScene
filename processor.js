let processor = {

    proportion: 0,
    vBG: null,

    timerCallbackMain: function () {
        if (vBG.paused || vBG.ended) {
            return;
        }
        processor.computeFrame();
        window.requestAnimationFrame(processor.timerCallbackMain);
    },

    doLoad: function () {
        vBG = document.getElementById("vBG");
        this.action = document.getElementById("action");
        this.c1 = document.getElementById("c1");
        this.ctx1 = this.c1.getContext("2d");
        this.c2 = document.getElementById("c2");
        this.ctx2 = this.c2.getContext("2d");
        let self = this;
        vBG.addEventListener("play", function () {
            self.width = vBG.videoWidth * 0.6;
            self.height = vBG.videoHeight * 0.6;
            c1.width = self.width;
            c1.height = self.height;
            c2.width = self.width;
            c2.height = self.height;
            self.timerCallbackMain();
        }, false);
    },

    computeFrame: function () {
        if (this.action.paused || this.action.ended) {
            this.ctx1.drawImage(vBG, 0, 0, this.width, this.height);
        }
        else {
            this.ctx2.drawImage(vBG, 0, 0, this.width, this.height);
            let frame1 = this.ctx2.getImageData(0, 0, this.width, this.height);
            this.ctx2.drawImage(this.action, 0, 0, this.width, this.height);
            let frame2 = this.ctx2.getImageData(0, 0, this.width, this.height);

            for (let i = 0; i < frame2.data.length; i += 4) {

                if (frame2.data[i] > 10 && frame2.data[i + 1] > 10 && frame2.data[i + 2] > 10) {
                    if (processor.proportion < 255) {
                        var p = 1 - processor.proportion;
                        frame1.data[i] = frame2.data[i];
                        frame1.data[i + 1] = frame2.data[i + 1];
                        frame1.data[i + 2] = frame2.data[i + 2];
                        frame1.data[i + 3] = processor.proportion;
                    }
                    else {
                        frame1.data[i] = frame2.data[i];
                        frame1.data[i + 1] = frame2.data[i + 1];
                        frame1.data[i + 2] = frame2.data[i + 2];
                    }
                }
            }
            this.ctx1.putImageData(frame1, 0, 0);
            processor.proportion += 1;
        }
        return;
    }
};

loadCSV = function () {
    document.getElementById("loadCSVArea").hidden = true;
    var fileInput = document.getElementById("csv");
    var reader = new FileReader();
    reader.onload = function () {
        var rows = reader.result.split(/[\n]/);
        var elementCount = 0;
        for (var i = 1; i < rows.length - 1; i++) {
            var columns = rows[i].split(/[,]/);
            switch (columns[0]) {
                case "BG":
                    let v = document.createElement("video");
                    v.id = "vBG";
                    v.muted = true;
                    v.autoplay = true;
                    v.loop = true;
                    v.src = columns[1];
                    v.width = 0;
                    v.height = 0;
                    document.getElementById("bgContain").append(v);
                    break;
                case "BGI":
                    var c = document.getElementById("c1");
                    c.style.backgroundImage = `url(${columns[1]})`;
                    c.style.backgroundSize = "cover";
                    break;
                case "Object":
                    var a = document.createElement("video");
                    a.id = "action";
                    a.src = columns[1];
                    a.controls = true;
                    a.hidden = true;
                    document.getElementById("actions").append(a);
                    break;
                default:
                    break;
            }
        }
        processor.doLoad();
    };
    reader.readAsBinaryString(fileInput.files[0]);
};

vedioControl = function (keyCode) {
    if (keyCode === 123) return;
    console.log(keyCode);
    var a = document.getElementById("action");
    if (a.paused || a.ended) {
        a.play();
    }
    else {
        a.pause();
    }
};