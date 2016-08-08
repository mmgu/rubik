//
// run tests by "qunit -c rubik.js -t rubik-tests.js [--timeout 10000]"
//
;(function(QUnit, Rubik) {

'use strict';

var r0 = new Rubik();

QUnit.test("rotate", function(assert) {
	var r = new Rubik();
	assert.ok(r.rotate_x().rotate_x().rotate_x().rotate_x().equalTo(r0), "rotate_x");
	assert.ok(r.rotate_x().rotate_x(true).equalTo(r0), "rotate_x reverse");
	assert.ok(r.rotate_X().rotate_X().rotate_X().rotate_X().equalTo(r0), "rotate_X");
	assert.ok(r.rotate_X().rotate_X(true).equalTo(r0), "rotate_X reverse");
	assert.ok(r.rotate_y().rotate_y().rotate_y().rotate_y().equalTo(r0), "rotate_y");
	assert.ok(r.rotate_y().rotate_y(true).equalTo(r0), "rotate_y reverse");
	assert.ok(r.rotate_Y().rotate_Y().rotate_Y().rotate_Y().equalTo(r0), "rotate_Y");
	assert.ok(r.rotate_Y().rotate_Y(true).equalTo(r0), "rotate_Y reverse");
	assert.ok(r.rotate_z().rotate_z().rotate_z().rotate_z().equalTo(r0), "rotate_z");
	assert.ok(r.rotate_z().rotate_z(true).equalTo(r0), "rotate_z reverse");
	assert.ok(r.rotate_Z().rotate_Z().rotate_Z().rotate_Z().equalTo(r0), "rotate_Z");
	assert.ok(r.rotate_Z().rotate_Z(true).equalTo(r0), "rotate_Z reverse");
});

QUnit.test("runseq", function(assert) {
	var i, r = new Rubik();

	assert.ok(r.init().run('xxxx').equalTo(r0), "xxxx");
	assert.ok(r.init().run('XXXX').equalTo(r0), "XXXX");
	assert.ok(r.init().run('yyyy').equalTo(r0), "yyyy");
	assert.ok(r.init().run('YYYY').equalTo(r0), "YYYY");
	assert.ok(r.init().run('zzzz').equalTo(r0), "zzzz");
	assert.ok(r.init().run('ZZZZ').equalTo(r0), "ZZZZ");

	assert.ok(r.init().run('ruflbdDBLFUR').equalTo(r0), "ruflbdDBLFUR");

	r.init();
	for (i = 0; i < 6; i++)
		r.run('ruRurUUR');
	assert.ok(r.equalTo(r0), "ruRurUUR");
});

QUnit.test("findBlock1", function(assert) {
	var r = new Rubik();
	var block = r.xyz;
	assert.ok(r.rotate_x().findBlock(block) === 'xyZ', "x");
	assert.ok(r.rotate_y().findBlock(block) === 'xyz', "y");
	assert.ok(r.rotate_z().findBlock(block) === 'xYz', "z");
});

QUnit.test("findBlock2", function(assert) {
	var r = new Rubik();
	var block = r.oyz;
	assert.ok(r.rotate_x().findBlock(block) === 'oyz', "x");
	assert.ok(r.rotate_y().findBlock(block) === 'Xyo', "y");
	assert.ok(r.rotate_z().findBlock(block) === 'Xyo', "z");
});

QUnit.test("solveL1oYz", function(assert) {
	var r = new Rubik();
	assert.ok(r.init().run('U').solveL1oYz().equalAt(r0, 'oYz'), "U");
	assert.ok(r.init().run('R').solveL1oYz().equalAt(r0, 'oYz'), "R");
	assert.ok(r.init().run('F').solveL1oYz().equalAt(r0, 'oYz'), "F");
	assert.ok(r.init().run('L').solveL1oYz().equalAt(r0, 'oYz'), "L");
	assert.ok(r.init().run('D').solveL1oYz().equalAt(r0, 'oYz'), "D");
	assert.ok(r.init().run('B').solveL1oYz().equalAt(r0, 'oYz'), "B");
});

QUnit.test("solveL1cross", function(assert) {
	var r = new Rubik();
	var blocks = ['oYz', 'oYZ', 'xYo', 'XYo'];
	assert.ok(r.init().run('R').solveL1cross().equalAt(r0, blocks), "1");
	assert.ok(r.init().run('ruRurUUR').solveL1cross().equalAt(r0, blocks), "2");
	assert.ok(r.init().run('LfLBBlFLBBLL').solveL1cross().equalAt(r0, blocks), "3");
	assert.ok(r.init().run('rufUdlb').solveL1cross().equalAt(r0, blocks), "4");
});

QUnit.test("solveL1XYz", function(assert) {
	var r = new Rubik();
	assert.ok(r.init().run('U').solveL1XYz().equalAt(r0, 'XYz'), "U");
	assert.ok(r.init().run('R').solveL1XYz().equalAt(r0, 'XYz'), "R");
	assert.ok(r.init().run('F').solveL1XYz().equalAt(r0, 'XYz'), "F");
	assert.ok(r.init().run('L').solveL1XYz().equalAt(r0, 'XYz'), "L");
	assert.ok(r.init().run('D').solveL1XYz().equalAt(r0, 'XYz'), "D");
	assert.ok(r.init().run('B').solveL1XYz().equalAt(r0, 'XYz'), "B");
});

QUnit.test("solveL1corner", function(assert) {
	var r = new Rubik();
	var blocks = ['xYz', 'XYz', 'XYZ', 'xYZ'];
	assert.ok(r.init().run('urfldbRRL').solveL1corner().equalAt(r0, blocks), "1");
	assert.ok(r.init().run('ruRurUUR').solveL1corner().equalAt(r0, blocks), "2");
	assert.ok(r.init().run('LfLBBlFLBBLL').solveL1corner().equalAt(r0, blocks), "3");
	assert.ok(r.init().run('rufUdlb').solveL1corner().equalAt(r0, blocks), "4");
});

QUnit.test("solveL1", function(assert) {
	var r = new Rubik();
	var blocks = ['oYz', 'oYZ', 'xYo', 'XYo', 'oYo', 'xYz', 'XYz', 'XYZ', 'xYZ'];
	assert.ok(r.init().run('urfldbRRL').solveL1().equalAt(r0, blocks), "1");
	assert.ok(r.init().run('ruRurUUR').solveL1().equalAt(r0, blocks), "2");
	assert.ok(r.init().run('LfLBBlFLBBLL').solveL1().equalAt(r0, blocks), "3");
	assert.ok(r.init().run('rufUdlb').solveL1().equalAt(r0, blocks), "4");
});

QUnit.test("solveL2Xoz", function(assert) {
	var r = new Rubik();
	assert.ok(r.init().run('urfldbRRL').solveL1().run('xx').solveL2Xoz().run('xx').equalAt(r0, 'XoZ'), "1");
	assert.ok(r.init().run('ruRurUUR').solveL1().run('xx').solveL2Xoz().run('xx').equalAt(r0, 'XoZ'), "2");
	assert.ok(r.init().run('LfLBBlFLBBLL').solveL1().run('xx').solveL2Xoz().run('xx').equalAt(r0, 'XoZ'), "3");
	assert.ok(r.init().run('rufUdlb').solveL1().run('xx').solveL2Xoz().run('xx').equalAt(r0, 'XoZ'), "4");
});

QUnit.test("solveL2", function(assert) {
	var r = new Rubik();
	var blocks = ['ooz', 'ooZ', 'xoo', 'Xoo', 'xoz', 'Xoz', 'XoZ', 'xoZ'];
	assert.ok(r.init().run('urfldbRRL').solveL1().run('xx').solveL2().run('xx').equalAt(r0, blocks), "1");
	assert.ok(r.init().run('ruRurUUR').solveL1().run('xx').solveL2().run('xx').equalAt(r0, blocks), "2");
	assert.ok(r.init().run('LfLBBlFLBBLL').solveL1().run('xx').solveL2().run('xx').equalAt(r0, blocks), "3");
	assert.ok(r.init().run('rufUdlb').solveL1().run('xx').solveL2().run('xx').equalAt(r0, blocks), "4");
});

QUnit.test("solveL3cross", function(assert) {
	var r = new Rubik();
	var s = [ 'ufRR', 'ldBRR', 'LLbuFFdr', 'urfldbRRL', 'ruRurUUR', 'LfLBBlFLBBLL', 'rufUdlb' ];
	for (var i = 0; i < s.length; i++) {
		r.init().run(s[i]).solveL1().run('xx').solveL2().solveL3cross();
		var color = r.oYo[1];
		assert.ok(r.oYz[1] == color && r.oYZ[1] == color &&	r.XYo[1] == color && r.xYo[1] == color, "1");
	}
});

QUnit.test("solveL3TopColors", function(assert) {
	var r = new Rubik();
	var s = [ 'ufRR', 'ldBRR', 'LLbuFFdr', 'urfldbRRL', 'ruRurUUR', 'LfLBBlFLBBLL', 'rufUdlb' ];
	for (var i = 0; i < s.length; i++) {
		r.init().run(s[i]).solveL1().run('xx').solveL2().solveL3TopColors();
		var color = r.oYo[1];
		assert.ok(r.XYz[1] == color && r.XYZ[1] == color && r.xYz[1] == color && r.xYZ[1] == color &&
			r.oYz[1] == color && r.oYZ[1] == color && r.XYo[1] == color && r.xYo[1] == color, "1");
	}
});

QUnit.test("solveL3", function(assert) {
	var r = new Rubik();
	var s = [ 'ufRR', 'ldBRR', 'LLbuFFdr', 'urfldbRRL', 'ruRurUURY', 'LfLBBlFLBBLL',
			'rufUdlb', 'BUuLLuRRRLF' ];
	for (var i = 0; i < s.length; i++) {
		r.init().run(s[i]).solveL1().run('xx').solveL2().solveL3().run('xx');
		assert.ok(r.equalTo(r0) ||
				r.run('Y').equalTo(r0) ||
				r.run('Y').equalTo(r0) ||
				r.run('Y').equalTo(r0),
				s[i]);
	}
});

/*
QUnit.test("solve random", function(assert) {
	var r = new Rubik(), s;
	for (var i = 0; i < 1000; i++) {
		s = r.getRandomCmd();
		r.init().run(s).solveL1().run('xx').solveL2().solveL3().run('xx');
		assert.ok(r.equalTo(r0) ||
				r.run('Y').equalTo(r0) ||
				r.run('Y').equalTo(r0) ||
				r.run('Y').equalTo(r0),
				s);
	}
});
*/

})(QUnit, global.Rubik);
