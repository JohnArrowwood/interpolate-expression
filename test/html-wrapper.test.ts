import { expect } from 'chai';
import 'mocha';

import { interpolate } from '../src/index';
import { Expression, VariableValues } from 'progressive-eval';
import { htmlWrapper } from '../src/html-wrapper';

function verify( expr: Expression, context: VariableValues ) {
    let s = interpolate( expr, context, htmlWrapper );
    expect( s ).to.contain( '<span' );
    expect( s ).to.contain( '</span>' );
    expect( s ).to.contain( 'class="expr-value' );
    return s;
}
describe( "Convenience wrapper to encase interpolated values in HTML <span> tags", function() {

    it( 'wraps null values', function() {
        let s = verify( '{{nonexistant}}', {nonexistant:null} );
        expect( s ).to.contain( 'expr-null' );
        expect( s ).to.contain( 'title="Null or Not Evaluated"' );
        expect( s ).to.contain( '{{ nonexistant }}' );
    });

    it( 'wraps undefined values', function() {
        let s = verify( '{{undef}}', {undef:undefined} );
        expect( s ).to.contain( 'expr-undefined' );
        expect( s ).to.contain( 'title="Undefined"' );
        expect( s ).to.contain( '{{ undef }}' );
    });

    it( 'wraps strings', function() {
        let s = verify( '{{"string"}}', {undef:undefined} );
        expect( s ).to.contain( 'expr-string' );
        expect( s ).to.contain( 'expr-primitive' );
        expect( s ).to.contain( 'title="\\"string\\""' );
        expect( s ).to.contain( ">string<" );
    });

    it( 'wraps numbers', function() {
        let s = verify( '{{123}}', {undef:undefined} );
        expect( s ).to.contain( 'expr-number' );
        expect( s ).to.contain( 'expr-primitive' );
        expect( s ).to.contain( 'title="123' );
        expect( s ).to.contain( ">123<" );
    });

    it( 'wraps booleans', function() {
        let s = verify( '{{true}}', {undef:undefined} );
        expect( s ).to.contain( 'expr-boolean' );
        expect( s ).to.contain( 'expr-primitive' );
        expect( s ).to.contain( 'title="true"' );
        expect( s ).to.contain( ">true<" );
    });

    it( 'wraps short arrays', function() {
        let s = verify( '{{[1,2]}}', {undef:undefined} );
        expect( s ).to.contain( 'expr-array-value' );
        expect( s ).to.contain( 'title="[1,2]"' );
        expect( s ).to.contain( ">[1,2]<" );
    });

    it( 'wraps long arrays', function() {
        let s = verify( '{{[1,2,3,4,5,6,7]}}', {undef:undefined} );
        expect( s ).to.contain( 'expr-array-value' );
        expect( s ).to.contain( 'title="[1,2,3,4,5,6,7]"' );
        expect( s ).to.contain( ">[1,2,3,...]<" );
    });

    it( 'wraps object', function() {
        let s = verify( '{{o}}', {o:{foo:'bar'}} );
        expect( s ).to.contain( 'expr-object-value' );
        expect( s ).to.contain( 'title="o"' );
        expect( s ).to.match( />{\s*"foo":\s*"bar"\s*}</ );
    });

    it( 'wraps functions', function() {
        let s = verify( '{{foo}}', {foo:()=>'bar'} );
        expect( s ).to.contain( 'expr-function' );
        expect( s ).to.contain( 'expr-invalid' );
        expect( s ).to.contain( 'title="Function Call"' );
        expect( s ).to.match( />{{ foo }}</ );
    });

    it( 'handles the unexpected', function() {
        let s = verify( '{{symbol}}', {symbol:Symbol('foo')} );
        expect( s ).to.contain( 'expr-type-unknown' );
        expect( s ).to.contain( 'title=""' );
        expect( s ).to.contain( '>{{ symbol }} = Symbol(foo)<' );

    });

});