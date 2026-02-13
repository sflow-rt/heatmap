// Copyright (c) 2026 InMon Corp. ALL RIGHTS RESERVED

(function ($) {
    "use strict";

    function hslToRgb(h, s, l) {
        let r, g, b;
        if (s === 0) r = g = b = l;
        else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            const hue2rgb = (t) => {
                if (t < 0) t += 1; if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            r = hue2rgb(h + 1/3); g = hue2rgb(h); b = hue2rgb(h - 1/3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    $.widget('inmon.heatmap', {
        options: {
            axisShow: true,
            axisColor: '#eee',
            radius: 10
        },

        _create: function() {
            this.element.addClass('heatmap');
            this._canvas = $('<canvas/>').appendTo(this.element);
            this._points = [];
        },

        draw: function(points) {
            var canvas = this._canvas[0];
            if (!canvas || !canvas.getContext)
                return;

            this._points = points;
            var ctx = canvas.getContext('2d', { willReadFrequently: true });
            var h = this._canvas.height();
            var w = this._canvas.width();
            var ratio = window.devicePixelRatio;
            if (ratio && ratio > 1) {
                canvas.height = h * ratio;
                canvas.width = w * ratio;
                ctx.scale(ratio, ratio);
            } else {
                canvas.height = h;
                canvas.width = w;
            }
            ctx.globalCompositeOperation = 'screen';
            var radius = this.options.radius;
            points.forEach(p => {
                const x = p.x * w;
                const y = p.y * h;
                const z = p.z;
                const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
                // Use the magnitude (z) to scale the opacity of the gradient
                grad.addColorStop(0, `rgba(0,0,0,${z * 0.5})`);
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
            }); 
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imgData.data;
            for (let i = 0; i < pixels.length; i += 4) {
                const alpha = pixels[i + 3];
                if (alpha > 0) {
                    const hue = (1 - alpha / 255) * 240;
                    const rgb = hslToRgb(hue / 360, 1, 0.5);
                    pixels[i] = rgb[0];
                    pixels[i + 1] = rgb[1];
                    pixels[i + 2] = rgb[2];
                    pixels[i + 3] = Math.min(255, alpha * 1.5);
                }
            }
            ctx.globalCompositeOperation = 'source-over';
            ctx.putImageData(imgData, 0, 0);
            if(this.options.axisShow) {
                ctx.strokeStyle = this.options.axisColor;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(w, h);
                ctx.stroke();
            }
        }
    });
})(jQuery);
