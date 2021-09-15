const system = require('system');
const page = require('webpage').create();

const source = system.args[1];
const dest = system.args[2];

page.open(source, function() {
        const size = page.evaluate(function() {
            const svg = document.getElementsByTagName('svg')[0];
            const aspectRatio = svg.getAttribute("width") / svg.getAttribute("height");

            const newHeight = 2160; //4K
            const newWidth = newHeight * aspectRatio;
            
            svg.setAttribute("width", newWidth);
            svg.setAttribute("height", newHeight);

            return {'width': newWidth, 'height': newHeight};
        });

        page.viewportSize = { width: size.width, height: size.height };
        page.render(dest, {format: 'png', quality: '100'});
        phantom.exit(0);
});
