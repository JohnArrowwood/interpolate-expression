import * as jsep from 'jsep';
import * as expr from 'expression-eval';

import { GenericObject } from './index';
import { AST, canEvaluate, evaluate } from 'progressive-eval';
import { arrayToString, objectToString } from './formatter';

export function interpolate( s: string, values: GenericObject = {}, wrap: Function = null ) {
    let result: string = '',
        i: number = 0, 
        open: number = 0, 
        close: number = 0,
        expression: string = '', 
        ast: AST,
        value: any;

    function skipAhead(n) {
        result += s.substr( i, n );
        i += n;
    }
    while ( i < ( s.length - 1 ) && ( open = s.indexOf('{{',i) ) >= i ) {
        if ( open > i ) {
            result += s.substr(i,open-i);
            i = open;
        }
        if ( ( close = s.indexOf('}}',i) ) > i ) {
            expression = s.substr( open+2, (close-open-2) );
            try {
                ast = jsep( expression ) as AST;
                if ( canEvaluate.apply( this, [ ast, values ] ) ) {
                    value = expr.eval.apply( this, [ ast, values ] );
                } else {
                    value = null;
                }
                if ( wrap ) {
                    value = wrap( expression, value, ast );
                } else {
                    if ( value === null ) {
                        value = 'null';
                    } else if ( value === undefined ) {
                        value = 'undefined';
                    }
                    else switch( typeof( value ) ) {
                        case 'function': 
                            value = `[ {{${expression.trim()}}} is a Function ]`; 
                            break;
                        case 'object': 
                            if ( Array.isArray( value ) ) value = arrayToString( value );
                            else                          value = objectToString( value );
                            break;
                    }
                    
                }
                result += value.toString();
                i = close + 2;
            }
            catch (e) {
                console.log( e );
                // not a valid expression.  
                // skip it and move on
                skipAhead(2);
            }
        } else {
            skipAhead(2);
        }
    }
    if ( i < s.length ) {
        result += s.substr(i);
    }
    return result;
}