export function limitArray( list: Array<any> ) {
    if ( list.length > 3 ) {
        let result = list.slice( 0, 3 );
        result.push( '...' );
        return result;
    } else {
        return list;
    }
}

export function escapeQuotes( s: string ): string {
    return s.replace( /\\/g, '\\\\' ).replace( /"/g, '\\"' );
}

export function arrayToString( list ): string {
    return JSON.stringify( limitArray( list ) ).replace( /"\.\.\."\s*]$/, '...]' );
}

export function objectToString( value ): string {
    return JSON.stringify( value, null, 2 );
}
