var assert = require('assert');
var { $ } = require('../salt')

var state = {}

describe('Utils::basic', function() {
	describe('noText()', function() {
		it('should return true for empty string', function() {
			assert.equal($.utils.noText(''), true);
		});

		it('should return true for null', function() {
			assert.equal($.utils.noText(null), true);
		});

		it('should return true for undefined', function() {
			assert.equal($.utils.noText(undefined), true);
		})
		
		it('should return true for string of whitespace', function() {
			assert.equal($.utils.noText('   '), true);
		});
		
		it('should return false for string with text', function() {
			assert.equal($.utils.noText('  a '), false);
		});
	});

	describe('hasText()', function() {
		it('should return false for empty string', function() {
			assert.equal($.utils.hasText(''), false);
		});

		it('should return false for null', function() {
			assert.equal($.utils.hasText(null), false);
		});

		it('should return false for undefined', function() {
			assert.equal($.utils.hasText(undefined), false);
		})
		
		it('should return false for string of whitespace', function() {
			assert.equal($.utils.hasText('   '), false);
		});
		
		it('should return true for string with text', function() {
			assert.equal($.utils.hasText('  a '), true);
		});
	});

	describe('notPattern()', function() {
		it('should return true for empty string', function() {
			assert.equal($.utils.notPattern(''), true);
		});

		it('should return true for null', function() {
			assert.equal($.utils.notPattern(null), true);
		});

		it('should return true for undefined', function() {
			assert.equal($.utils.notPattern(undefined), true);
		})
		
		it('should return true for string of whitespace', function() {
			assert.equal($.utils.notPattern('   '), true);
		});
		
		it('should return false for regex', function() {
			assert.equal($.utils.notPattern(/a/), false);
		});
		
		it('should return false for string with text', function() {
			assert.equal($.utils.notPattern('  a '), false);
		});
	});

	describe('isString()', function() {
		it('should return true for string', function() {
			assert.equal($.utils.isString('a'), true);
		});

		it('should return false for object', function() {
			assert.equal($.utils.isString({}), false);
		});

		it('should return false for array', function() {
			assert.equal($.utils.isString([]), false);
		});

		it('should return false for regex', function() {
			assert.equal($.utils.isString(/a/), false);
		});

		it('should return false for function', function() {
			assert.equal($.utils.isString(function() {}), false);
		});

		it('should return false for number', function() {
			assert.equal($.utils.isString(1), false);
		});

		it('should return false for null', function() {
			assert.equal($.utils.isString(null), false);
		});

		it('should return false for undefined', function() {
			assert.equal($.utils.isString(undefined), false);
		});
	});

	describe('isFunction()', function() {
		it('should return true for function', function() {
			assert.equal($.utils.isFunction(function() {}), true);
		});

		it('should return false for string', function() {
			assert.equal($.utils.isFunction('a'), false);
		});

		it('should return false for object', function() {
			assert.equal($.utils.isFunction({}), false);
		});

		it('should return false for array', function() {
			assert.equal($.utils.isFunction([]), false);
		});

		it('should return false for regex', function() {
			assert.equal($.utils.isFunction(/a/), false);
		});

		it('should return false for number', function() {
			assert.equal($.utils.isFunction(1), false);
		});

		it('should return false for null', function() {
			assert.equal($.utils.isFunction(null), false);
		});

		it('should return false for undefined', function() {
			assert.equal($.utils.isFunction(undefined), false);
		});
	});

	describe('isRegex()', function() {
		it('should return true for regex', function() {
			assert.equal($.utils.isRegex(/a/), true);
		});

		it('should return false for string', function() {
			assert.equal($.utils.isRegex('a'), false);
		});

		it('should return false for object', function() {
			assert.equal($.utils.isRegex({}), false);
		});

		it('should return false for null', function() {
			assert.equal($.utils.isRegex(null), false);
		});

		it('should return false for undefined', function() {
			assert.equal($.utils.isRegex(undefined), false);
		});
	});

	describe('isObject()', function() {
		it('should return true for object', function() {
			assert.equal($.utils.isObject({}), true);
		});

		it('should return false for string', function() {
			assert.equal($.utils.isObject('a'), false);
		});

		it('should return false for array', function() {
			assert.equal($.utils.isObject([]), false);
		});

		it('should return false for regex', function() {
			assert.equal($.utils.isObject(/a/), false);
		});

		it('should return false for function', function() {
			assert.equal($.utils.isObject(function() {}), false);
		});

		it('should return false for number', function() {
			assert.equal($.utils.isObject(1), false);
		});

		it('should return false for null', function() {
			assert.equal($.utils.isObject(null), false);
		});

		it('should return false for undefined', function() {
			assert.equal($.utils.isObject(undefined), false);
		});
	});

	describe('objectifyProp()', function() {
		it('should create object property if it does not exist', function() {
			let obj = {}
			$.utils.objectifyProp(obj, 'prop')
			assert.equal(obj.prop != undefined, true);
		});

		it('should convert property to object with property value if exists', function() {
			let obj = { prop: 'value' }
			$.utils.objectifyProp(obj, 'prop')
			assert.deepEqual(obj.prop, { _value: 'value' });
		});

		it('should return false if property did not exist', function() {
			let obj = {}
			assert.equal($.utils.objectifyProp(obj, 'prop'), false);
		});

		it('should return true if property existed', function() {
			let obj = { prop: 'value' }
			assert.equal($.utils.objectifyProp(obj, 'prop'), true);
		});

		it('should create object property without id if it does not exist', function() {
			let obj = {}
			$.utils.objectifyProp(obj, 'prop', 'id')
			assert.equal(obj.prop != undefined, true);
			assert.equal(obj.prop.id == undefined, true);
		});

		it('should not create object property with id if it exists', function() {
			let obj = { prop: { id: 'value' } }
			// Default id is _value, so this should not 
			// overwrite the existing is already an object.
			$.utils.objectifyProp(obj, 'prop')
			assert.equal(obj.prop.id, 'value');
		});
	});

	describe('splitProp()', function() {
		it('should split string property into object with sub properties', function() {
			let obj = { prop: 'x,y,z' }
			$.utils.splitProp(obj, 'prop', ',', 'a,b,c')
			assert.deepEqual(obj.prop, { a: 'x', b: 'y', c: 'z', _value: 'x,y,z' });
		});

		it('should return false if property did not exist', function() {
			let obj = {}
			assert.equal($.utils.splitProp(obj, 'prop', ',', 'a,b,c'), false);
		});

		it('should return true if property existed', function() {
			let obj = { prop: 'value' }
			assert.equal($.utils.splitProp(obj, 'prop', ',', 'a,b,c'), true);
		});
	});

	describe('stringToArray()', function() {
		it('should split string into array', function() {
			assert.deepEqual($.utils.stringToArray('a,b,c'), ['a', 'b', 'c']);
		});

		it('should split string into array with custom delimiter', function() {
			assert.deepEqual($.utils.stringToArray('1x2x3', 'x'), ['1', '2', '3']);
		});
	});
});

describe('Salt::Vars', function() {
	describe('getDSV()', function() {
		this.beforeEach(function() {
			state = { vars: {} }
		});

		it('should set a DSV object if valid form', function() {
			$.getDSV('!!!a::b::c\n', state)
			assert.equal(state.DSV, 'a::b::c');
		});

		it('should return true if valid form', function() {
			assert.equal($.getDSV('!!!a::b::c\n', state), true);
		});

		it('should not set DSV object if invalid form', function() {
			$.getDSV('a::b::c', state)
			assert.equal(state.DSV, undefined);
		});

		it('should return false if no DSV prefix', function() {
			assert.equal($.getDSV('a'), false);
		});

		it('should return false if no DSV vars', function() {
			assert.equal($.getDSV('!!!'), false);
		});

		it('should return false if no DSV values', function() {
			assert.equal($.getDSV('!!!::\n'), false);
		});
	});

	describe('loadVars()', function() {
		this.beforeEach(function() {
			state = { vars: {}, DSV: 'x::y::z' }
			// Reset varlist delimiter since it gets changed.
			$.delimiters.DSV.varList = /[\s,]+/g
		});

		it('should load DSV into vars if found', function() {
			$.loadVars('a b c', state)
			assert.deepEqual(state.vars, { a: 'x', b: 'y', c: 'z' });
		});

		it('should also allow commas in varlist', function() {
			$.loadVars('a, b, c', state)
			assert.deepEqual(state.vars, { a: 'x', b: 'y', c: 'z' });
		});

		it('should allow other delimiters if varList delimiter changed', function() {
			// Dash instead of comma.
			$.delimiters.DSV.varList = /[\s-]+/g
			$.loadVars('a - b - c', state)
			assert.deepEqual(state.vars, { a: 'x', b: 'y', c: 'z' });
		})

		it('should throw error if DSV not found', function() {
			state.DSV = undefined
			assert.throws(() => $.loadVars('a b c', state), Error);
		});
	});

	describe('splitVar', function() {
		this.beforeEach(function() {
			state = { vars: { thing: 'x,y,z' } }
		});

		it('should split the given variable into an object', function() {
			$.splitVar('thing', ',', 'a,b,c', state)
			assert.deepEqual(state.vars, { thing: { a: 'x', b: 'y', c: 'z', _value: 'x,y,z' } });
		});

		it('should create an empty object with null props if var does not exist', function() {
			$.splitVar('does not exist', ',', 'a, b, c', state)
			assert.deepEqual(state.vars, {
				thing: 'x,y,z', 'does not exist': { a: null, b: null, c: null } 
			});
		});
	});
});