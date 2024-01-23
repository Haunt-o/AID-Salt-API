// If state object somehow doesn't exist, set it.
if (state === undefined) { 
  var state = {}
}

// If state object doesn't properties used by SALT, set them.
state.memory ||= {}
state.vars ||= {}
state.commands ||= {}
state.data ||= {}

// If $ object doesn't exist, set it.
// It likely doesn't, but this is just in case.
if ($ === undefined) {
  /**
   * The SALT library object.
   * Uses $ as its name to keep name short and convenient for scripting.
   * @namespace $
   * @global
   */
  var $ = {}
}

/**
 * Utility functions for SALT library.
 * @namespace $.utils
 * @memberof $
 */
$.utils = {
  /**
   * Checks if the given object is a string with no text, or not a string.
   * @param {any} obj The object to check for text. 
   * @returns {boolean} True if the object has no text, or false if's a string
   *                    with text.
   */
	noText: (obj) => obj == undefined || !$.utils.isString(obj) || obj.trim().length == 0,
  /**
   * Checks if the given object is a string with text.
   * @param {any} obj The object to check for text.
   * @returns {boolean} True if the object is a string with text, false otherwise.
   */
	hasText: (obj) => !$.utils.noText(obj),
  /**
   * Checks if the given object is not a regex, or a string with no text.
   * (Which is a valid pattern for a scanning text).
   * @param {any} obj The object to check if it's a regex or string.
   * @returns {boolean} True if the object is not a pattern, false otherwise.
   */
  notPattern: (obj) => !$.utils.isRegex(obj) && $.utils.noText(obj),
  /**
   * Checks if the given object is a string.
   * @param {any} obj The object to check if it's a string.
   * @returns {boolean} True if the object is a string, false otherwise.
   */
  isString: (obj) => typeof obj === 'string' || obj instanceof String,
  /**
   * Checks if the given object is a function.
   * Note that function is
   * "any object that has constructor, call, and apply methods".
   * @param {any} obj The object to check if it's a function.
   * @returns {boolean} True if the object is a function, false otherwise.
   */
	isFunction: (obj) => !!(obj && obj.constructor && obj.call && obj.apply),
  /**
   * Checks if the given object is a regex.
   * @param {any} obj The object to check if it's a regex.
   * @returns {boolean} True if the object is a regex, false otherwise.
   */
	isRegex: (obj) => obj instanceof RegExp,
  /**
   * Checks if the given object is an object, as in literally just an object.
   * Null, RegExp, String, Array, functions, and other "technically objects" are
   * not objects.
   * @param {any} obj The object to check if it's an object.
   * @returns {boolean} True if the object is an object, false otherwise.
   */
	isObject: (obj) => obj != null && typeof obj === 'object'
            && Array.isArray(obj) === false && !(obj instanceof RegExp),
  /**
   * Takes a property in an object and makes it an object if it isn't already,
   * storing the original value in a property with the name given by the id
   * parameter.
   * If the property already exists and is an object, it does nothing.
   * If the property doesn't exist, it creates it and sets it to an empty object.
   * @param {Object} obj The object containing the property to objectify. 
   * @param {string} prop The name of the property to objectify.
   * @param {string} [id='_value']  The name of the property to store the
   *                                original value in. Defaults to '_value'.
   * @returns {boolean} True if the property exists and was objectified, false
   *                    otherwise.
   */
	objectifyProp: (obj, prop, id='_value') => {
		if (!(prop in obj)) {
			obj[prop] = {}
			return false
		}

		let value = obj[prop]
		
		if (!$.utils.isObject(value)) {
			obj[prop] = {}
			
			if (value !== null) {
				obj[prop][id] = value
			}
		}
			
		return true
	},
  /**
   * Takes a string property in an object and splits its value by the given
   * delimiter, storing the split values as subproperties of the property.
   * The original property will be converted into an object which will
   * contain the new subproperties.
   * If the property doesn't exist, it creates an object for the property and
   * sets the subproperties to null.
   * 
   * @param {Object} obj The object containing the property to split.
   * @param {string} prop The name of the property to split.
   * @param {string|RegExp} delimiter The delimiter to split the property value
   *                                  by.
   * @param {string} subPropList  A string of subproperty names to store the
   *                              split values in, separated by the delimiter.
   * @returns {boolean} True if the property exists and was split, false
   *                    otherwise.
   */
	splitProp(obj, prop, delimiter, subPropList) {
		let propExists = $.utils.objectifyProp(obj, prop)
		let subprops = $.utils.stringToArray(subPropList)

    if (!propExists) {
      for (let subprop of subprops) {
        obj[prop][subprop] = null
      }

      return false
    }

		let values = $.utils.stringToArray(obj[prop]._value, delimiter)
		
		for (let subprop of subprops) {
			obj[prop][subprop] = values.shift()
		}
		
		return true
	},
  /**
   * Splits a string into an array of strings by the given delimiter.
   * Effectively the same as String.prototype.split, but made as a utility
   * function to ensure consistency in library.
   * @param {string} str The string to split.
   * @param {string|RegExp} [delimiter=/[\s,]+/g]
   *                        The delimiter to split the string by.
   * @returns {string[]} An array of strings split by the delimiter.
   */
	stringToArray(str, delimiter=/[\s,]+/g) {
		return str.split(delimiter)
	}
}

/**
 * Delimiter text values used for SALT library.
 * Can be changed by user if wanted.
 */
$.delimiters = {
	DSV: { prefix: '!!!', vars: '::', end: '\n', varList: /[\s,]+/g },
  command: { prefix: '>' }
}

/**
 * Reads the DSV from the given scenario context and stores it in the
 * state object.
 * 
 * @param {string} text The scenario context to read through to find the DSV to
 *                      read from. 
 * @param {$AID_STATE} stateObj The object to store the DSV in.
 *                              Defaults to the global state object, and is only
 *                              intended to be changed for testing.
 * @returns {boolean} True if a DSV was found and properly read, false
 *                    otherwise.
 */
$.getDSV = function(text, stateObj=state) {
	let prefixIndex = text.indexOf($.delimiters.DSV.prefix)
	
  // If there is no DSV prefix, return false.
	if (prefixIndex == -1) { return false }

	let dsvStart = prefixIndex + $.delimiters.DSV.prefix.length
	let dsvEnd = text.indexOf($.delimiters.DSV.end, dsvStart)

  // If there is no end to the DSV, return false.
  if (dsvEnd == -1) { return false }

	dsvLine = text.slice(dsvStart, dsvEnd)

  // If there are no actual variables, return false.
  if (dsvLine.split($.delimiters.DSV.vars).filter($.utils.hasText).length < 1) {
    return false
  }

	stateObj.DSV = dsvLine

	return true
}

/**
 * Loads the variables from the DSV into the state object.
 * 
 * @param {string} varList  A string of variable names to load from the DSV.
 *                          Should be in order that matches the DSV in the
 *                          scenario text.
 * @param {$AID_STATE} stateObj  The object to store the variables in.
*                                Defaults to the global state object, and is only
*                                intended to be changed for testing.
 */
$.loadVars = function(varList, stateObj=state) {
  if (stateObj.DSV == undefined) {
    throw new Error('DSV not found in state object to load.')
  }

	let values = $.utils.stringToArray(stateObj.DSV, $.delimiters.DSV.vars)
	let varNames = $.utils.stringToArray(varList, $.delimiters.DSV.varList)
	
	varNames.forEach(name => stateObj.vars[name] = values.shift())
}

/**
 * Takes a variable and splits its value by the given delimiter, storing the
 * split values as subproperties of the variable.
 * The original variable will be converted into an object which will
 * contain the new subproperties.
 * If the variable doesn't exist, it creates an object for the variable and
 * sets the subproperties to null.
 * 
 * @param {string} varName The name of the variable to split.
 * @param {string} delimiter The delimiter to split the variable by.
 * @param {string} propList The list of subproperties to store the split values
 *                          in.
 * @param {$AID_STATE} stateObj The object to store the variables in.
 *                              Defaults to the global state object, and is only
 *                              intended to be changed for testing.
 */
$.splitVar = function(varName, delimiter, propList, stateObj=state) {
	$.utils.splitProp(stateObj.vars, varName, delimiter, propList)
}

/**
 * Adds all the variables in the given string list to the state object with
 * the given value.
 * 
 * @param {string} varList A string of names for variables to add.
 * @param {any|Function} value  The value to set the variables to.
 *                              If a function, it will be called with the
 *                              variables object and the variable name as
 *                              parameters, and the return value will be used as
 *                              the value.
 * @param {$AID_STATE} stateObj 
 */
$.addVars = function(varList, value, stateObj=state) {
	const varNames = $.utils.stringToArray(varList)
	
	varNames.forEach(name => {
		stateObj.vars[varName] = $.utils.isFunction(value)
			? value(stateObj.vars, varName)
			: value
	})
}

/**
 * Checks if the given variables exist in the state object.
 * 
 * @param {string} varList A string of names for variables to check.
 * @param {$AID_STATE} stateObj The object to check for the variables in.
 *                              Defaults to the global state object, and is only
 *                              intended to be changed for testing.
 * @returns {boolean} True if all variables exist, false otherwise.
 */
$.hasVars = function(varList, stateObj=state) {
	const varNames = $.utils.stringToArray(varList)
	
	return varNames.every(name => name in stateObj.vars)
}

/**
 * Adds a command to the state object.
 * 
 * @note  The callback function will be converted to a string and stored in the
 *        state object, as AI Dungeon cannot store functions in its state object
 *        between script runs as the state object is converted to JSON.
 * @param {string} name The name of the command.
 * @param {string} argList  A string of argument names for the command.
 *                          Should be in order that matches the arguments in the
 *                          callback function, and should match the names of the
 *                          variables in the state object.
 * @param {Function} callback The function to call when the command is run.
 * @param {$AID_STATE} stateObj The object to store the command in.
 *                              Defaults to the global state object, and is only
 *                              intended to be changed for testing.
 */
$.addCommand = function(name, argList, callback, stateObj=state) {
	stateObj.commands[name] = {
		args: $.utils.stringToArray(argList),
		callbackString: callback.toString()
	}
}

/**
 * Reads the given text for a command and returns an object containing the
 * found command and arguments.
 * 
 * @param {string} text The text to read for a command.
 * @param {$AID_STATE} stateObj The object to check for the command in.
 *                              Defaults to the global state object, and is only
 *                              intended to be changed for testing.
 * @returns {Object} An object containing the command and arguments, or null if
 *                   no command was found.
 */
$.parseCommand = function(text, stateObj=state) {
  let cmdText = text.trim()

  if (!cmdText.startsWith($.delimiters.command.prefix)) {
    return null
  }

  cmdText = cmdText
    .slice($.delimiters.command.prefix.length).trim()
  
  let args = []
  let firstSpace = cmdText.search(/\s+/)
  let name = cmdText.slice(0, firstSpace)

  let command = stateObj.commands[name]
  if (command == undefined) { return null }

  args = cmdText
    .slice(name.length)
    .trim()
    .split(/\s{2,}/g)
    .filter($.utils.hasText)

  return { command, args }
}

/**
 * Runs the given command with the given arguments.
 * 
 * @param {*} name The name of the command to run.
 * @param {*} args The arguments to pass to the command callback.
 * @param {*} stateObj  The object that has the command to run.
 *                      Defaults to the global state object, and is only
 *                      intended to be changed for testing.
 * @returns {any} The return value of the command callback.
 */
$.runCommand = function(name, args, stateObj=state) {
	return eval(stateObj.commands[name].callbackString)(...args)
}

// Added to export module for use/testing outside of AI Dungeon.
module.exports = { $ }