var labeling = parseInt(findGetParameter("label")); //0.. phase labeling, 1 state labeling
var with_pwm = parseInt(findGetParameter("pwm")); // if 1 draw pwm signal

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    var items = location.search.substr(1).split("&");
    for (var index = 0; index < items.length; index++) {
        tmp = items[index].split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    }
    return result;
}

const getTime = typeof performance === 'function' ? performance.now : Date.now;

function init() {
    window.requestAnimationFrame(draw);
}

function drawAddedVect(ctx, mag1, mag2, phase1, phase2, color1, color2) {
    ctx.save();

    ctx.lineWidth = 4;
    ctx.rotate(-phase1);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(mag1, 0);
    ctx.strokeStyle = color1;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.lineWidth = 4;
    ctx.rotate(-phase1);
    ctx.translate(mag1, 0);
    ctx.rotate(-(phase2-phase1));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(mag2, 0);
    ctx.strokeStyle = color2;
    ctx.stroke();
    ctx.restore();
}

function drawStateLabeling(ctx, radius, i){
    ctx.save(); //text
    ctx.translate(radius+75, 0);
    ctx.rotate((i+1)*Math.PI/3);
    if(i == 5){
        ctx.fillStyle = 'rgba(150, 0, 0, 0.4)';
        ctx.fillText("v1 (001)", 0, 10);
    }
    if(i == 0){
        ctx.fillStyle = 'rgba(0, 0, 150, 0.4)';
        ctx.fillText("v3 (011)", 0, 10);
    }
    if(i == 1){
        ctx.fillStyle = 'rgba(0, 150, 0, 0.4)';
        ctx.fillText("v2 (010)", 0, 10);
    }
    if(i == 2){
        ctx.fillStyle = 'rgba(150, 0, 0, 0.4)';
        ctx.fillText("v6 (110)", 0, 10);
    }
    if(i == 3){
        ctx.fillStyle = 'rgba(0, 0, 150, 0.4)';
        ctx.fillText("v4 (100)", 0, 10);
    }
    if(i == 4){
        ctx.fillStyle = 'rgba(0, 150, 0, 0.4)';
        ctx.fillText("v5 (101)", 0, 10);
    }
    ctx.restore();
}

function drawPhaseLabeling(ctx, radius, i){
    ctx.save(); //text
    ctx.translate(radius+55, 0);
    ctx.rotate((i+1)*Math.PI/3);
    if(i == 5){
        ctx.fillStyle = 'rgba(150, 0, 0, 0.4)';
        ctx.fillText("A", 0, 10);
    }
    if(i == 0){
        ctx.fillStyle = 'rgba(0, 0, 150, 0.4)';
        ctx.fillText("-C", 0, 10);
    }
    if(i == 1){
        ctx.fillStyle = 'rgba(0, 150, 0, 0.4)';
        ctx.fillText("B", 0, 10);
    }
    if(i == 2){
        ctx.fillStyle = 'rgba(150, 0, 0, 0.4)';
        ctx.fillText("-A", 0, 10);
    }
    if(i == 3){
        ctx.fillStyle = 'rgba(0, 0, 150, 0.4)';
        ctx.fillText("C", 0, 10);
    }
    if(i == 4){
        ctx.fillStyle = 'rgba(0, 150, 0, 0.4)';
        ctx.fillText("-B", 0, 10);
    }
    ctx.restore();
}

function drawPWM(ctx, radius, alpha, m){
    ctx.save();
    var unit = radius/20;
    var t = 10*unit;

    ctx.translate(-t,5*unit);

    var PI_THIRD = Math.PI/3;
    var sector =  Math.floor(alpha*3/(Math.PI));

    /* t0 is time to be on v0 and v7
     * t1 and t2 is time to be on the two vectors
     */
    alpha_sector = alpha % (PI_THIRD);
    if(sector % 2){ //toggle switching order every sector to reduce switching losses
        t1 = t * m * Math.sin(alpha_sector);
        t2 = t * m * Math.sin((PI_THIRD - alpha_sector));
    }else{
        t1 = t * m * Math.sin((PI_THIRD - alpha_sector));
        t2 = t * m * Math.sin(alpha_sector);
    }
    var t0 = Math.max(0, t - t1 - t2);

    var ovrflw = t;
    var OCR1 = ovrflw * (t0/2) / t;
    var OCR2 = OCR1 + ovrflw * t1 / t;
    var OCR3 = OCR2 + ovrflw * t2 / t;

    var o_A;
    var o_B;
    var o_C;

    switch(sector){
        case 0: // A B C
            o_A = OCR1;
            o_B = OCR2;
            o_C = OCR3;
            break;
        case 1: // B A C
            o_B = OCR1;
            o_A = OCR2;
            o_C = OCR3;
            break;
        case 2: // B C A
            o_B = OCR1;
            o_C = OCR2;
            o_A = OCR3;
            break;
        case 3: // C B A
            o_C = OCR1;
            o_B = OCR2;
            o_A = OCR3;
            break;
        case 4: // C A B
            o_C = OCR1;
            o_A = OCR2;
            o_B = OCR3;
            break;
        case 5: // A C B
            o_A = OCR1;
            o_C = OCR2;
            o_B = OCR3;
            break;
    }
    //ctx.fillStyle = 'rgba(0,0,0,'+opacity+')';
    //ctx.strokeRect(0,-unit,alpha*2*t/(2*Math.PI),1*unit);

    var opacity = 0.3;

    ctx.fillStyle = 'rgba(150,0,0,'+opacity+')';
    ctx.fillRect(o_A,0*unit,2*(t-o_A),1*unit);
    ctx.fillStyle = 'rgba(0,150,0,'+opacity+')';
    ctx.fillRect(o_B,2*unit,2*(t-o_B),1*unit);
    ctx.fillStyle = 'rgba(0,0,150,'+opacity+')';
    ctx.fillRect(o_C,4*unit,2*(t-o_C),1*unit);
    //ctx.fillStyle = 'rgba(150,150,150,'+opacity+')';
    //ctx.strokeRect(0,0,2*t,5*unit);
    var opacity = 0.2;

    for(var i=1; i<=2; i++){
        for(var dir=0; dir<2; dir++){
            ctx.translate(i*(-2+dir*6)*t,0);
            ctx.fillStyle = 'rgba(150,0,0,'+opacity+')';
            ctx.fillRect(o_A,0*unit,2*(t-o_A),1*unit);
            ctx.fillStyle = 'rgba(0,150,0,'+opacity+')';
            ctx.fillRect(o_B,2*unit,2*(t-o_B),1*unit);
            ctx.fillStyle = 'rgba(0,0,150,'+opacity+')';
            ctx.fillRect(o_C,4*unit,2*(t-o_C),1*unit);
            //ctx.fillStyle = 'rgba(150,150,150,'+opacity+')';
            //ctx.strokeRect(0,0,2*t,5*unit);
        }
        var opacity = 0.2 - opacity*0.5;
        ctx.translate(i*-2*t,0);
    }
}

let lastUpdate = getTime();
function draw(timestamp) {
    const now = getTime();
    const delta = (now - lastUpdate);
    lastUpdate = now;

    var ctx = document.getElementById('canvas').getContext('2d');
    var canvas = document.getElementById('canvas');
    var dpr = window.devicePixelRatio;

    canvas.width = window.innerWidth*2*dpr/1.5;
    canvas.height = window.innerHeight*2*dpr/1.5;


    if(canvas.height<canvas.width){
        var radius = canvas.height * 0.4;
    }else{
        var radius = canvas.width * 0.45;
    }

    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clear canvas
    //ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height, );

    ctx.save();
    /*
    ctx.fillStyle = 'rgba(0, 153, 255, 0.4)';
    ctx.strokeStyle = 'rgba(0, 153, 255, 0.4)';*/
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.translate(ctx.canvas.width/2, ctx.canvas.height/2);
    ctx.lineCap = "round";

    if( typeof draw.t == 'undefined' ) {
        draw.t = 0;
    }
    draw.t = draw.t + 0.001*delta*(2*Math.PI)*(0.000+(in_a.value/100)**2);
    //var alpha = 1/6 * Math.PI;
    var alpha = (draw.t % (2*Math.PI)); //-((2 * Math.PI) / 60) * time.getSeconds() - ((2 * Math.PI) / 60000) * time.getMilliseconds();
    var phi = (alpha) % (Math.PI/3);
    var m = in_m.value / 100;// / Math.cos(Math.PI/6);
    var sector =  Math.floor(alpha*3/(Math.PI));

    //set slider label values
    document.getElementById('slideroutput').innerHTML = (Math.round(m * 100) / 100).toFixed(2);;
    document.getElementById('slideroutputb').innerHTML = Math.round(60*(in_a.value/100)**2);

    ////
    var radius_m = radius * Math.cos(Math.PI/6);
    ctx.save();
    ctx.textAlign = "center";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    for(var i=0; i<6; i++){ //hexagon
        ctx.rotate(-Math.PI/3);
        ctx.lineTo(radius, 0);
        ctx.font = "6vh Arial";

        if(labeling == 0)
            drawPhaseLabeling(ctx, radius, i);
        else
            drawStateLabeling(ctx, radius, i);
    }

    ctx.stroke();
    ctx.restore();

    if(labeling == 1){
        ctx.save();
        ctx.font = "6vh Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = 'rgba(20, 20, 20, 0.5)';
        ctx.fillText("v0 (000)", 0, -30);
        ctx.fillText("v7 (111)", 0, 50);
        ctx.restore();
    }

    //title
    ctx.save();
    ctx.restore();

    // alpha pointer
    ctx.save();
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.4)';
    ctx.rotate(-alpha);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(m*radius_m, 0);
    ctx.stroke();

    ctx.arc(m*radius_m,0,5,0,2*Math.PI);
    ctx.fill();
    ctx.restore();

    var vect1 = sector * Math.PI/3;
    var vect2 = vect1 + Math.PI/3;
    //vektor x
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 45, 0, 0.1)';
    ctx.rotate(-vect1);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);
    ctx.stroke();
    ctx.restore();

    //vektor y
    ctx.save();
    ctx.strokeStyle = 'rgba(123, 45, 255, 0.1)';
    ctx.rotate(-vect2);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);
    ctx.stroke();
    ctx.restore();
    //*/


    // vector components
    var t2 = radius * m * Math.sin(phi);
    var t1 = radius * m * Math.sin(Math.PI/3-phi);

    var cx, cy;
    var c_a = 'rgba(255, 45, 0, 0.4)';
    var c_b = 'rgba(85, 245, 85, 0.4)';
    var c_c = 'rgba(45, 0, 255, 0.4)';
    switch (sector) {
        case 0: cx = c_a;
            cy = c_c;
            break;
        case 1: cx = c_b;
            cy = c_c;
            break;
        case 2: cx = c_b;
            cy = c_a;
            break;
        case 3: cx = c_c;
            cy = c_a;
            break;
        case 4: cx = c_c;
            cy = c_b;
            break;
        case 5: cx = c_a;
            cy = c_b;
            break;
    }

    if(sector%2)
        drawAddedVect(ctx, t2, t1, vect2, vect1, cx, cy);
    else
        drawAddedVect(ctx, t1, t2, vect1, vect2, cx, cy);

    ctx.strokeStyle = 'rgba(150, 150, 150, 0.4)';
    ctx.beginPath();
    ctx.arc(0, 0, radius_m, 0, Math.PI * 2, false);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(150, 150, 150, 0.4)';
    ctx.beginPath();
    ctx.arc(0, 0, radius_m*m, 0, Math.PI * 2, false);
    ctx.stroke();

    if(with_pwm != 0)
        drawPWM(ctx, radius, alpha, m);

    window.requestAnimationFrame(draw);
}

init();
