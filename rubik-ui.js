;(function($, Phoria){

'use strict';

var requestAnimFrame = window.requestAnimationFrame || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame || 
        window.msRequestAnimationFrame ||
        function(c) { window.setTimeout(c, 15); };

var rubik = new Rubik(), cubes,
    rubikColors = [ null,
                [ 255, 255, 0 ],
                [ 0, 255, 0 ],
                [ 255, 127, 0 ],
                [ 255, 0, 0 ],
                [ 0, 0, 255 ],
                [ 255, 255, 255 ]
            ];

var scene, renderer, originalSceneGraph = [], moveSequence = [], moveSpeed = { value: 5 };

function createCubes(rubik) {
    var i, j, k, cubes = [], xpos = ['lL', '', 'rR'],
        ypos = ['dD', '', 'uU'], zpos = ['fF', '', 'bB'];
    for(i = -1; i < 2; i++) {
        for(j = -1; j < 2; j++) {
            for(k = -1; k < 2; k++) {
                var c = Phoria.Util.generateUnitCube(0.45);
                var cube = Phoria.Entity.create({
                    points: c.points,
                    edges: c.edges,
                    polygons: c.polygons
                });
                var block = rubik.getBlock(i, j, k);
                // axis to polygon index mapping: 0:z, 1:X, 2:Z, 3:x, 4:Y, 5:y
                if (block[0])
                    cube.polygons[i < 0? 3 : 1].color = rubikColors[block[0]];
                if (block[1])
                    cube.polygons[j < 0? 5 : 4].color = rubikColors[block[1]];
                if (block[2])
                    cube.polygons[k < 0? 0 : 2].color = rubikColors[block[2]];
                cube.rubikPos = 'xXyYzZ' + xpos[i+1] + ypos[j+1] + zpos[k+1];
                cubes.push(cube);
            }
        }
    }
    return cubes;
}

function initCubes() {
    cubes = createCubes(rubik);
    scene.graph = originalSceneGraph.concat(cubes);
}

function getCube(i, j, k) {
    return cubes[(i+1)*9 + (j+1)*3 + k + 1];
}

function getAnimateFn() {
    var step = 0;
    var animate = function() {
        var i, j, k, cmd = moveSequence[0];
        for (i = 0; i < 27; i++)
            cubes[i].identity();
        if (cmd) {
            for (i = 0; i < 27; i++) {
                var cube = cubes[i];
                if (cube.rubikPos.indexOf(cmd) >= 0) {
                    var index; 
                    if ((index = "lRXLrx".indexOf(cmd)) >= 0) {
        	                cube.rotateX((index > 2? -step : step) * Phoria.RADIANS);
                    } else if ((index = "dUYDuy".indexOf(cmd)) >= 0) {
        	                cube.rotateY((index > 2? -step : step) * Phoria.RADIANS);
                    } else if ((index = "fBZFbz".indexOf(cmd)) >= 0) {
        	                cube.rotateZ((index > 2? -step : step) * Phoria.RADIANS);
                    } 
                }
            }
            step += moveSpeed.value;
            if (step >= 90) {
                step = 0;
                moveSequence.splice(0, 1);
                rubik.run(cmd);
                initCubes();
            }
        }
        for(i = -1; i < 2; i++) {
            for(j = -1; j < 2; j++) {
                for(k = -1; k < 2; k++) {
                    getCube(i, j, k).translate(vec3.fromValues(i, j, k));
                }
            }
        }
        scene.modelView();
        renderer.render(scene);
        requestAnimFrame(animate);
    };
    return animate;
}

function addAction(cmd) {
    for (var i = 0; i < cmd.length; i++) {
        moveSequence.push(cmd[i]);
    }
}

$(function(){
    // get the canvas DOM element and the 2D drawing context
    var canvas = document.getElementById('canvas');

    // create the scene and setup camera, perspective and viewport
    scene = new Phoria.Scene();
    scene.camera.position = {
        x: 10.0,
        y: 5.0,
        z: -8.0
    };
    scene.perspective.aspect = canvas.width / canvas.height;
    scene.viewport.width = canvas.width;
    scene.viewport.height = canvas.height;

    // create a canvas renderer
    renderer = new Phoria.CanvasRenderer(canvas);

    // add a grid to help visualise camera position etc.
    var plane = Phoria.Util.generateTesselatedPlane(8, 8, 0, 20);
    originalSceneGraph.push(Phoria.Entity.create({
        points: plane.points,
        edges: plane.edges,
        polygons: plane.polygons,
        style: {
            drawmode: "wireframe",
            shademode: "plain",
            linewidth: 0.5,
            objectsortmode: "back"
        }
    }));

    originalSceneGraph.push(Phoria.DistantLight.create({ direction: { x: 1, y: 1, z: 1 }}));
    originalSceneGraph.push(Phoria.DistantLight.create({ direction: { x: -1, y: -1, z: -1 }}));

    // add GUI controls
    var gui = new dat.GUI();
    var f = gui.addFolder('Camera Position');
    f.add(scene.camera.position, "x").min(-100).max(100);
    f.add(scene.camera.position, "y").min(-100).max(100);
    f.add(scene.camera.position, "z").min(-100).max(100);
    f.open();
    f = gui.addFolder('Move Speed');
    f.add(moveSpeed, "value").min(1).max(15).step(1);
    f.open();

    $('#rotate button').on('click', function(){
        addAction($(this).text());
    });

    $('#run').on('click', function(){
        addAction($('#command').val());
    });

    $('#reset').on('click', function(){
        rubik.init();
        moveSequence = [];
        initCubes();
    });

    $('#solve').on('click', function(){
        var solution = { cmd: '' };
        rubik.clone().solve(solution);
        $('#command').val(solution.cmd);
        addAction(solution.cmd);
    });

    var info = $('#info');
    function print(s) {
        info.val(info.val() + '\n' + s);
    }
    $('#randtest').on('click', function(){
        var s = rubik.getRandomCmd();
        rubik.init().run(s);
        moveSequence = [];
        initCubes();
        print('state ' + s);
        var solution = { cmd: '' };
        rubik.clone().solve(solution);
        print('solved by ' + solution.cmd);
        addAction(solution.cmd);
    });

    // start animation
    initCubes();
    requestAnimFrame(getAnimateFn());
});

})(jQuery, Phoria);
