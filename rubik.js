;(function(global) {

'use strict';

// Axis:
//           Y
//           | / Z
//           |/
//    x -----o----- X
//          /|
//       z / |
//           y
//
// name each block: (-1,-1,-1) is 'xyz', (1,1,1) is 'XYZ', (0,0,0) is 'ooo', etc.
// each block is represented by a tuple of colors (cx, cy, cz) which indicates
// the color on each direction.

function blockName(i, j, k) {
	var x = [ 'x', 'o', 'X' ], y = [ 'y', 'o', 'Y' ], z = [ 'z', 'o', 'Z' ];
	return x[i+1] + y[j+1] + z[k+1];
}

// constructor to setup a rubik in initial state or from another rubik
function Rubik(other) {
	this.init(other);
}

Rubik.prototype.init = function(other) {
	// color indexes. 0 indicates none
	var cx = [ 1, 0, 2 ], cy = [ 3, 0, 4 ], cz = [ 5, 0, 6 ];
	var i, j, k, block;
	
	for (i = -1; i < 2; i++) {
		for (j = -1; j < 2; j++) {
			for (k = -1; k < 2; k++) {
				block = blockName(i, j, k);
				if (other)
					this[block] = [ other[block][0], other[block][1], other[block][2] ]; 
				else
					this[block] = [ cx[i+1], cy[j+1], cz[k+1] ]; 
			}
		}
	}
	return this;
};

Rubik.prototype.clone = function() {
	return new Rubik(this);
};

Rubik.prototype.getBlock = function(i, j, k) {
	return this[blockName(i, j, k)];
};

// check if two blocks are same. if loose == true, ignore color position.
function sameBlock(a, b, loose) {
	if (loose) {
		return ((a[0] == b[0]? 1 : a[0] == b[1]? 2 : a[0] == b[2]? 4 : 8) |
			(a[1] == b[0]? 1 : a[1] == b[1]? 2 : a[1] == b[2]? 4 : 8) |
			(a[2] == b[0]? 1 : a[2] == b[1]? 2 : a[2] == b[2]? 4 : 8)) == 7;
	}
	return a[0] == b[0] && a[1] == b[1] && a[2] == b[2];
}

// check if two rubiks are in same state.
Rubik.prototype.equalTo = function(other) {
	var i, j, k, block;
	
	for (i = -1; i < 2; i++) {
		for (j = -1; j < 2; j++) {
			for (k = -1; k < 2; k++) {
				block = blockName(i, j, k);
				if (!sameBlock(this[block], other[block]))
					return false;
			}
		}
	}
	return true;
};

// check if two rubiks are in same state for specified blocks
Rubik.prototype.equalAt = function(other, blocks) {
	if (typeof blocks === 'string')
		blocks = [ blocks ];
	for (var i = 0; i < blocks.length; i++) {
		if (!sameBlock(this[blocks[i]], other[blocks[i]]))
			return false;
	}
	return true;
};

Rubik.prototype.dump_z = function() {
	console.log(' ' + this.xYz[1] + this.oYz[1] + this.XYz[1]);
	console.log('' + this.xYz[0] + this.xYz[2] + this.oYz[2] + this.XYz[2] + this.XYz[0]);
	console.log('' + this.xoz[0] + this.xoz[2] + this.ooz[2] + this.Xoz[2] + this.Xoz[0]);
	console.log('' + this.xyz[0] + this.xyz[2] + this.oyz[2] + this.Xyz[2] + this.Xyz[0]);
	console.log(' ' + this.xyz[1] + this.oyz[1] + this.Xyz[1]);
};

Rubik.prototype.dump = function(side) {
	console.log('side ' + side);
	switch(side) {
	case 'z': this.dump_z(); break;
	case 'Z': this.clone().run('YY').dump_z(); break;
	case 'x': this.clone().run('y').dump_z(); break;
	case 'X': this.clone().run('Y').dump_z(); break;
	case 'y': this.clone().run('X').dump_z(); break;
	case 'Y': this.clone().run('x').dump_z(); break;
	}
};

// move some blocks from specified map
Rubik.prototype.translate = function(bmap, cmap, layer, reverse) {
	var t = {}, block, i, fromName, toName;
	for (i = 0; i < 8; i++) {
		fromName = (reverse? bmap[i].to : bmap[i].from).replace('-', layer);
		toName = (reverse? bmap[i].from : bmap[i].to).replace('-', layer);
		block = this[fromName];
		t[toName] = [ block[cmap[0]], block[cmap[1]], block[cmap[2]] ];
	}
	for (i = 0; i < 8; i++) {
		block = bmap[i].to.replace('-', layer);
		this[block] = t[block];
	}
	return this;
};

// rotate one layer around X axis (right hand rule: clockwise towards X direction)
Rubik.prototype.rotate_xoX = function(layer, reverse) {
	return this.translate([
		{ from: '-oZ', to: '-Yo' },
		{ from: '-YZ', to: '-Yz' },
		{ from: '-Yo', to: '-oz' },
		{ from: '-Yz', to: '-yz' },
		{ from: '-oz', to: '-yo' },
		{ from: '-yz', to: '-yZ' },
		{ from: '-yo', to: '-oZ' },
		{ from: '-yZ', to: '-YZ' } ], [ 0, 2, 1 ], layer, reverse);
};

Rubik.prototype.rotate_x = function(reverse) {
	return this.rotate_xoX('x', reverse);
};

Rubik.prototype.rotate_X = function(reverse) {
	return this.rotate_xoX('X', !reverse);
};

// rotate one layer around Y axis (right hand rule: clockwise towards Y direction)
Rubik.prototype.rotate_yoY = function(layer, reverse) {
	return this.translate([
		{ from: 'x-z', to: 'X-z' },
		{ from: 'o-z', to: 'X-o' },
		{ from: 'X-z', to: 'X-Z' },
		{ from: 'X-o', to: 'o-Z' },
		{ from: 'X-Z', to: 'x-Z' },
		{ from: 'o-Z', to: 'x-o' },
		{ from: 'x-Z', to: 'x-z' },
		{ from: 'x-o', to: 'o-z' } ], [ 2, 1, 0 ], layer, reverse);
};

Rubik.prototype.rotate_y = function(reverse) {
	return this.rotate_yoY('y', reverse);
};

Rubik.prototype.rotate_Y = function(reverse) {
	return this.rotate_yoY('Y', !reverse);
};

// rotate one layer around Z axis (right hand rule: clockwise towards Z direction)
Rubik.prototype.rotate_zoZ = function(layer, reverse) {
	return this.translate([
		{ from: 'xy-', to: 'xY-' },
		{ from: 'oy-', to: 'xo-' },
		{ from: 'Xy-', to: 'xy-' },
		{ from: 'Xo-', to: 'oy-' },
		{ from: 'XY-', to: 'Xy-' },
		{ from: 'oY-', to: 'Xo-' },
		{ from: 'xY-', to: 'XY-' },
		{ from: 'xo-', to: 'oY-' } ], [ 1, 0, 2 ], layer, reverse);
};

Rubik.prototype.rotate_z = function(reverse) {
	return this.rotate_zoZ('z', reverse);
};

Rubik.prototype.rotate_Z = function(reverse) {
	return this.rotate_zoZ('Z', !reverse);
};

// execute a move sequence. optionally append s to solution
Rubik.prototype.run = function(s, solution) {
	var i;
	for (i = 0; i < s.length; i++) {
		switch(s[i]) {
			case 'R': this.rotate_X();     break;
			case 'r': this.rotate_X(true); break;
			case 'L': this.rotate_x();     break;
			case 'l': this.rotate_x(true); break;
			case 'D': this.rotate_y();     break;
			case 'd': this.rotate_y(true); break;
			case 'U': this.rotate_Y();     break;
			case 'u': this.rotate_Y(true); break;
			case 'F': this.rotate_z();     break;
			case 'f': this.rotate_z(true); break;
			case 'B': this.rotate_Z();     break;
			case 'b': this.rotate_Z(true); break;
			case 'x': this.rotate_xoX('x').rotate_xoX('o').rotate_xoX('X'); break;
			case 'y': this.rotate_yoY('y').rotate_yoY('o').rotate_yoY('Y'); break;
			case 'z': this.rotate_zoZ('z').rotate_zoZ('o').rotate_zoZ('Z'); break;
			case 'X': this.rotate_xoX('x', true).rotate_xoX('o', true).rotate_xoX('X', true); break;
			case 'Y': this.rotate_yoY('y', true).rotate_yoY('o', true).rotate_yoY('Y', true); break;
			case 'Z': this.rotate_zoZ('z', true).rotate_zoZ('o', true).rotate_zoZ('Z', true); break;
		}
	}
	if (solution)
		solution.cmd += s;
	return this;
};

var moveCmds = 'uUdDlLrRbBfF';
Rubik.prototype.getRandomCmd = function() {
    var i, n = Math.random() * 30, s = '';
    for (i = 0; i < n; i++)
        s += moveCmds[Math.floor(Math.random() * moveCmds.length)];
    return s;
};

// find a block with specified colors
Rubik.prototype.findBlock = function(block) {
	var i, j, k;
	for (i = -1; i < 2; i++) {
		for (j = -1; j < 2; j++) {
			for (k = -1; k < 2; k++) {
				var b = blockName(i, j, k);
				if (sameBlock(this[b], block, true))
					return b;
			}
		}
	}
	console.log("findBlock: unexpected result!");
};

var L1oYzSolutionMap = {
	'Xoz':	{ ci: 0, cmd: [ 'f', 'uRU' ]},
	'XoZ':	{ ci: 0, cmd: [ 'UUBuu', 'urU' ]},
	'xoZ':	{ ci: 0, cmd: [ 'UUbuu', 'ULu' ]},
	'xoz':	{ ci: 0, cmd: [ 'F', 'Ulu' ]},
	'oyz':	{ ci: 1, cmd: [ 'FF', 'fuRU' ]},
	'Xyo':	{ ci: 1, cmd: [ 'uRRU', 'uRUf' ]},
	'oyZ':	{ ci: 1, cmd: [ 'UUBBuu', 'UUBUrU' ]},
	'xyo':	{ ci: 1, cmd: [ 'ULLu', 'UluF' ]},
	'oYz':	{ ci: 1, cmd: [ '', 'FuRU' ]},
	'XYo':	{ ci: 1, cmd: [ 'RRdFF', 'rf' ]},
	'oYZ':	{ ci: 1, cmd: [ 'BBDDFF', 'burU' ]},
	'xYo':	{ ci: 1, cmd: [ 'LLDFF', 'LF' ]}
};

// move correct block to oYz without changing XYo, oYZ and xYo.
Rubik.prototype.solveL1oYz = function(solution) {
	var target = [ 0, this.oYo[1], this.ooz[2] ];
	var pos = this.findBlock(target);
	if (!pos)
		return false;
	var block = this[pos];
	var s = L1oYzSolutionMap[pos];
	s = s.cmd[target[1] == block[s.ci]? 0 : 1];
	return this.run(s, solution);
};

// move first layer cross
Rubik.prototype.solveL1cross = function(solution) {
	return this.solveL1oYz(solution)
		.run('Y', solution).solveL1oYz(solution)
		.run('Y', solution).solveL1oYz(solution)
		.run('Y', solution).solveL1oYz(solution)
		.run('Y', solution);
};

Rubik.prototype.solveL1XYzFromXyz = function(solution) {
	var target = [ this.Xoo[0], this.oYo[1], this.ooz[2] ];
	var block = this.Xyz;
	var s;

	// assert(sameBlock(target, block, true));
	if (target[1] == block[0])
		s = 'rdR';
	else if (target[1] == block[2])
		s = 'FDf';
	else
		s = 'rddRDrdR';

	return this.run(s, solution);
};

var moveToXyzSolutionMap = {
	'XYz': 'rdRD',
	'XYZ': 'bdB',
	'xYZ': 'BDDb',
	'xYz': 'fdFDD',
	'xyZ': 'DD',
	'xyz': 'D',
	'XyZ': 'd',
	'Xyz': ''
};

// move correct block to XYz without changing other blocks on L1.
Rubik.prototype.solveL1XYz = function(solution) {
	var target = [ this.Xoo[0], this.oYo[1], this.ooz[2] ];
	var pos = this.findBlock(target);
	if (!pos)
		return false;
	var block = this[pos];
	if (pos === 'XYz' && sameBlock(target, block))
		return this;
	// first move found block to Xyz
	var s = moveToXyzSolutionMap[pos];
	return this.run(s, solution).solveL1XYzFromXyz(solution);
};

Rubik.prototype.solveL1corner = function(solution) {
	return this.solveL1XYz(solution)
		.run('Y', solution).solveL1XYz(solution)
		.run('Y', solution).solveL1XYz(solution)
		.run('Y', solution).solveL1XYz(solution)
		.run('Y', solution);
};

Rubik.prototype.solveL1 = function(solution) {
	return this.solveL1cross(solution).solveL1corner(solution);
};

var moveL2EdgeToL3SolutionMap = {
	'Xoz': 'RurufUF',
	'XoZ': 'BuburUR',
	'xoZ': 'LulubUB',
	'xoz': 'FufulUL',
};

var moveL3EdgeToL2SolutionMap = {
	'oYz': [ 'URurufUF', 'uufUFURur' ],
	'XYo': [ 'UURurufUF', 'ufUFURur' ],
	'oYZ': [ 'uRurufUF', 'fUFURur' ],
	'xYo': [ 'RurufUF', 'UfUFURur' ]
};

// prerequisite: this.solveL1().run('xx') must be finished.
Rubik.prototype.solveL2Xoz = function(solution) {
	var target = [ this.Xoo[0], 0, this.ooz[2] ];
	var pos = this.findBlock(target);
	if (!pos)
		return false;
	var block = this[pos];
	if (pos == 'Xoz' && sameBlock(target, block))
		return this;
	// if block is found in L2, move to L3 first 
	if (pos[1] === 'o') {
		this.run(moveL2EdgeToL3SolutionMap[pos], solution);
		pos = this.findBlock(target);
		// assert(pos[1] === 'Y');
		block = this[pos];
	}
	var s = moveL3EdgeToL2SolutionMap[pos][target[0] == block[1]? 0 : 1];
	return this.run(s, solution);
};

Rubik.prototype.solveL2 = function(solution) {
	return this.solveL2Xoz(solution)
		.run('Y', solution).solveL2Xoz(solution)
		.run('Y', solution).solveL2Xoz(solution)
		.run('Y', solution).solveL2Xoz(solution)
		.run('Y', solution);
};

Rubik.prototype.solveL3cross = function(solution) {
	var color = this.oYo[1];
	while (this.oYz[1] != color || this.oYZ[1] != color ||
			this.XYo[1] != color || this.xYo[1] != color) {

		if (this.oYZ[1] == color && this.XYo[1] == color)
			this.run('u', solution);
		else if (this.XYo[1] == color && this.oYz[1] == color)
			this.run('uu', solution);
		else if (this.xYo[1] == color && this.oYz[1] == color)
			this.run('U', solution);
 
		this.run('rufUFR', solution);
	}
	return this;
};

function countColor(color, c1, c2, c3, c4) {
	var n = 0;
	if (c1 == color) n++;
	if (c2 == color) n++;
	if (c3 == color) n++;
	if (c4 == color) n++;
	return n;
}

// make all top colors correct
Rubik.prototype.solveL3TopColors = function(solution) {
	var color = this.oYo[1];
	this.solveL3cross(solution);

	if (this.XYz[1] != color || this.XYZ[1] != color ||
			this.xYz[1] != color || this.xYZ[1] != color ||
			this.oYz[1] != color || this.oYZ[1] != color ||
			this.XYo[1] != color || this.xYo[1] != color) {

		// make fish-pattern
		if (countColor(color, this.xYZ[1], this.XYZ[2], this.XYz[0], this.xYz[2]) == 1)
			this.run('ruRurUUR', solution);
		else if (countColor(color, this.XYZ[1], this.XYz[0], this.xYz[2], this.xYZ[0]) == 1)
			this.run('uruRurUUR', solution);
		else if (countColor(color, this.XYz[1], this.xYz[2], this.xYZ[0], this.XYZ[2]) == 1)
			this.run('uuruRurUUR', solution);
		else if (countColor(color, this.xYz[1], this.xYZ[0], this.XYZ[2], this.XYz[0]) == 1)
			this.run('UruRurUUR', solution);
		else if (countColor(color, this.XYZ[1], this.xYZ[2], this.xYz[0], this.XYz[2]) == 1)
			this.run('LUlULuul', solution);
		else if (countColor(color, this.xYZ[1], this.xYz[0], this.XYz[2], this.XYZ[0]) == 1)
			this.run('ULUlULuul', solution);
		else if (countColor(color, this.xYz[1], this.XYz[2], this.XYZ[0], this.xYZ[2]) == 1)
			this.run('UULUlULuul', solution);
		else if (countColor(color, this.XYz[1], this.XYZ[0], this.xYZ[2], this.xYz[0]) == 1)
			this.run('uLUlULuul', solution);

		while (this.xYZ[1] != color)
			this.run('U', solution);
		if (this.XYZ[2] == color)
			this.run('ruRurUUR', solution);
		else
			this.run('ULUlULuul', solution);
	}

	return this;
};

function sameColor(c1, c2, c3) {
	return (c1 == c2 && c2 == c3)? c1 : 0;
}

Rubik.prototype.solveL3 = function(solution) {
	this.solveL3TopColors(solution);

	var color, i;
	while (true) {
		for (i = 0; i < 3; i++) {
			color = sameColor(this.xYz[2], this.oYz[2], this.XYz[2]);
			if (color)
				break;
			this.run('Y', solution);
		}

		color = sameColor(this.xYz[2], this.oYz[2], this.XYz[2]);
		if (color) {
			if (this.XYz[0] == this.XYZ[0] && this.XYZ[2] == this.xYZ[2] && this.xYZ[0] == this.xYz[0])
				break;
			this.run('YY', solution);
		}

		if (this.xYz[2] == this.XYz[2] && this.XYz[0] == this.XYZ[0] &&
			this.XYZ[2] == this.xYZ[2] && this.xYZ[0] == this.xYz[0])
			this.run('RRUbFRRBfURR', solution);

		for (i = 0; i < 3; i++) {
			if (this.xYZ[2] == this.XYZ[2])
				break;
			this.run('Y', solution);
		}

		this.run('LfLBBlFLBBLL', solution);
	}

	while (this.ooz[2] != color)
		this.run('Yu', solution);

	if (this.XYo[0] != this.XYz[0] || this.XYZ[2] != this.oYZ[2]) {
		this.run('Y', solution);

		if (this.oYz[2] == this.Xoo[0])
			this.run('RRubFRRBfuRR', solution);
		else if (this.oYz[2] == this.ooZ[2])
			this.run('RRUbFRRBfURR', solution);
	}
	return this;
};

Rubik.prototype.solve = function (solution) {
	 return this.solveL1(solution)
		.run('xx', solution)
		.solveL2(solution)
		.solveL3(solution);
};

// the only symbol exported to global namespace
global.Rubik = Rubik;

})(this);
