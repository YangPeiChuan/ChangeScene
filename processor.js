let processor = {

    proportion: 0,

    timerCallbackMain: function () {
        if (this.video.paused || this.video.ended) {
            return;
        }
        processor.computeFrame();
        window.requestAnimationFrame(processor.timerCallbackMain);
    },

    timerCallbackAction: function () {
        if (this.action.paused || this.action.ended) {
            processor.proportion = 0;
            return;
        }
        processor.computeFrameAction();
        window.requestAnimationFrame(processor.timerCallbackAction);
    },


    doLoad: function () {
        this.video = document.getElementById("video");
        this.action = document.getElementById("action");
        this.c1 = document.getElementById("c1");
        this.ctx1 = this.c1.getContext("2d");
        this.c2 = document.getElementById("c2");
        this.ctx2 = this.c2.getContext("2d");
        let self = this;
        this.video.addEventListener("play", function () {
            self.width = self.video.videoWidth * 0.6;
            self.height = self.video.videoHeight * 0.6;
            c1.width = self.width;
            c1.height = self.height;
            c2.width = self.width;
            c2.height = self.height;
            self.timerCallbackMain();
        }, false);

        this.action.addEventListener("play", function () {
            self.timerCallbackAction();
        }, false);
    },

    computeFrame: function () {
        if (this.action.paused || this.action.ended) {
            this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
        }
        else {
            this.ctx2.drawImage(this.video, 0, 0, this.width, this.height);
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
    },

    computeFrameAction: function () {
        this.ctx2.drawImage(this.action, 0, 0, this.width, this.height);
        return;
    }
};


loadCSV = function () {
    document.getElementById("loadCSVArea").hidden = true;
    document.getElementById("videos").hidden = false;
    var fileInput = document.getElementById("csv");
    var reader = new FileReader();
    reader.onload = function () {
        console.log("loadCSV");
    };
    reader.readAsBinaryString(fileInput.files[0]);
};

document.addEventListener("DOMContentLoaded", () => {
    processor.doLoad();
});