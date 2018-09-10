import betterResult from './better-result';
import camelCase from './camel-case';

import comparator from './comparator';
import compareAB from './compare-ab';
import convertString from './convert-string';
import extend from './extend';

import flat from './flat';
import getByPath from './get-by-path';
import getOption from './get-option';
import hasFlag from './has-flag';
import isKnownCtor from './is-known-ctor';

import mix from './mix';
import paramsToObject from './params-to-object';
import setByPath from './set-by-path';
import toBool from './to-bool';
import unflat from './unflat';

import compareObjects from './compare-objects';
import mergeObjects from './merge-objects';
import triggerMethod, { triggerMethodOn } from './trigger-method/index.js';
import mergeOptions from './merge-options';

import { 
	isModel, isModelClass, isCollection, isCollectionClass, isView, isViewClass
} from '../vendors/helpers';

export {
	betterResult, camelCase,
	comparator, compareAB, convertString, extend,
	flat, getByPath, getOption, hasFlag, isKnownCtor, 
	mix, paramsToObject, setByPath, toBool, unflat,
	isModel, isModelClass, isCollection, isCollectionClass, isView, isViewClass,
	triggerMethod, triggerMethodOn, mergeOptions,
	compareObjects, mergeObjects
};
