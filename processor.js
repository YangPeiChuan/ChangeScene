let processor = {
    timerCallbackMain: function () {
        if (this.video.paused || this.video.ended) {
            return;
        }
        processor.computeFrame();
        window.requestAnimationFrame(processor.timerCallbackMain);
    },

    timerCallbackAction: function () {
        if (this.action.paused || this.action.ended) {
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
        this.proportion = 0.00001;
        let self = this;
        this.video.addEventListener("play", function () {
            self.width = self.video.videoWidth / 2;
            self.height = self.video.videoHeight / 2;
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

                if (frame2.data[i] > 0 && frame2.data[i + 1] > 0 && frame2.data[i + 2] > 0) {
                    if (this.proportion < 1) {
                        var p = 1 - this.proportion;
                        frame1.data[i] = frame1.data[i] * p + frame2.data[i] * this.proportion;
                        frame1.data[i + 1] = frame1.data[i] * p + frame2.data[i + 1] * this.proportion;
                        frame1.data[i + 2] = frame1.data[i] * p + frame2.data[i + 2] * this.proportion;
                        this.proportion = this.proportion + 0.00001;
                        console.log(this.proportion);
                    }
                    else {
                        frame1.data[i] = frame2.data[i];
                        frame1.data[i + 1] = frame2.data[i + 1];
                        frame1.data[i + 2] = frame2.data[i + 2];
                    }
                }
            }
            this.ctx1.putImageData(frame1, 0, 0);
        }
        return;
    },

    computeFrameAction: function () {
        this.ctx2.drawImage(this.action, 0, 0, this.width, this.height);
        return;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    processor.doLoad();
});