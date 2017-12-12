import { objectToString, arrayToString, escapeQuotes } from './formatter';

function wrap( type: string, title: string, value: string ) {
    return `<span class="expr-value expr-${type}" title="${escapeQuotes(title)}">${value}</span>`;
}

function notInterpolated( type: string, title: string, expression: string ) {
    return wrap( type + ' expr-invalid', title, '{{ ' + expression + ' }}' );
}

export function htmlWrapper( expr: string, value: any ) {
    if ( value === null ) {
        return notInterpolated( 'null','Null or Not Evaluated', expr );
    }
    if ( value === undefined ) {
        return notInterpolated( 'undefined','Undefined', expr );
    }
    switch ( typeof( value ) ) {
        case 'function':  return notInterpolated( 'function', 'Function Call', expr );
        case 'string':    return wrap('string expr-primitive', expr, value );
        case 'number':    return wrap('number expr-primitive', expr, value );
        case 'boolean':   return wrap('boolean expr-primitive', expr, value );
        case 'object':        
            let type;
            if ( Array.isArray( value ) ) {
                type = 'array-value';
                value = arrayToString( value );
            } else {
                type = 'object-value';
                value = objectToString( value );
            }
            return wrap(type,expr,value);
        default: 
            return wrap('type-unknown','',`{{ ${expr} }} = ${value.toString()}`);
    }
}
