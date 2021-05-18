import { Dictionary } from '@salesforce/ts-types';
const _ = require('underscore');
const clone = require('clone');
var util = require('../util');

const _ValidationRules: Dictionary<any> = {};

const BASERECORD = {
    is_system: true,
    type: "validation_rule",
  };

const addObjectValidationRule = function(objectName: string, json: any){
    if(!_ValidationRules[objectName]){
        _ValidationRules[objectName] = []
    }
    _ValidationRules[objectName].push(Object.assign({}, json, clone(BASERECORD), {_id: `${objectName}.${json.name}`}))
}

export const getObjectValidationRules = function(objectName: string){

    return _ValidationRules[objectName]
}

export const getAllObjectValidationRules = function(){

    let result = [];

    for(let objectName in _ValidationRules){
        let objectValidationRules = _ValidationRules[objectName]
        result = result.concat(objectValidationRules);
    }
    
    return result;
}

export const getObjectValidationRule = function(objectName: string, validationRuleName: string){
    const objectValidationRules = getObjectValidationRules(objectName);
    if(objectValidationRules){
        return _.find(objectValidationRules, function(validationRule){
            return validationRule.name === validationRuleName
        })
    }
}

export const addObjectValidationRuleConfig = (objectName: string, json: any) => {
    if (!json.name) {
        throw new Error('missing attribute name')
    }
    addObjectValidationRule(objectName, json);
}

export const loadObjectValidationRules = function (filePath: string){
    let validationRuleJsons = util.loadValidationRules(filePath);
    validationRuleJsons.forEach(element => {
        addObjectValidationRuleConfig(element.object_name, element);
    });
}
