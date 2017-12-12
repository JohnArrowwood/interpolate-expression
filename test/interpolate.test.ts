import { expect } from 'chai';
import 'mocha';

import { interpolate } from '../src/index';

describe( "Interpolate function", function() {

    context( 'string that does not contain any expressions', function() {
        
        it( 'should pass through the string unmodified', function() {
            let input = "this is a simple string with no interpolations";
            let expected = input;
            let actual = interpolate( input );
            expect( actual ).to.equal( expected );
        });
        
    });

    context( 'contains an expression', function() {
        
        it( 'should interpolate a boolean constant', function() {
            expect( interpolate( "{{true}}" ) ).to.equal( 'true' );
        });

        it( 'should interpolate a boolean expression', function() {
            expect( interpolate( "{{true && ! true}}" ) ).to.equal( 'false' );
        });

        it( 'should interpolate a string expression', function() {
            expect( interpolate( "{{'foo'+'bar'}}" ) ).to.equal( 'foobar' );
        });

        it( 'should interpolate a numeric expression', function() {
            expect( interpolate( "{{1+2}}" ) ).to.equal( '3' );
        });

        it( 'should interpolate an array expression', function() {
            expect( interpolate( "{{ ['A','B'] }}" ) ).to.equal( '["A","B"]' );
            expect( interpolate( "{{['A','B','C','D','E','F']}}" ) ).to.equal( '["A","B","C",...]' );
        });

    });

    context( 'expression references context', function() {
        let evalContext = {
            one: 1,
            two: 2,
            three: 3,
            abc: "abc",
            xyz: "xyz",
            alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
            yes: true,
            no: false,
            obj: {
                foo: "bar",
                blip: "baz"
            },
            f: () => "function-called"
        };

        it( 'should handle references to boolean values', function() {
            expect( interpolate( '{{ yes && no }}', evalContext ) ).to.equal( 'false' );
        });

        it( 'should handle references to numeric values', function() {
            expect( interpolate( '{{ one + two === three }}', evalContext ) ).to.equal( 'true' );
        });

        it( 'should handle references to strings', function() {
            expect( interpolate( '{{ abc + "-" + xyz }}', evalContext ) ).to.equal( 'abc-xyz' );
        });

        it( 'should support arrays', function() {
            expect( interpolate( '{{ alphabet }}', evalContext ) ).to.equal( '["A","B","C",...]' );
        });

        it( 'should support objects', function() {
            expect( interpolate( '{{ obj }}', evalContext ) ).to.equal( JSON.stringify( evalContext.obj, null, 2 ) );
        });

        it( 'should support object property references', function() {
            expect( interpolate( '{{ obj.foo }}', evalContext ) ).to.equal( "bar" );
        });

        it( 'should support function call expressions', function() {
            expect( interpolate( '{{ f() }}', evalContext ) ).to.equal( 'function-called' );
        });

        it( 'should complain if the function is not called', function() {
            expect( interpolate( '{{ f }}', evalContext ) ).to.equal( '[ {{f}} is a Function ]' );
        });

        it.skip( 'should support reference to this', function() {
            expect( interpolate.apply( { fruit: "apple" }, [ '{{ this.fruit + "-" + obj.foo }}', evalContext ] ) ).to.equal( 'apple-bar' );
        });

    });

    context( 'Number and placement of expression', function() {
        
        it( 'should handle the whole string being an expression', function(){
            expect( interpolate('{{"foo"}}') ).to.equal( 'foo' );
        });

        it( 'may start and end with different expressions with nothing in-between', function() {
            expect( interpolate('{{"abc"}}{{123}}') ).to.equal( 'abc123' );
        });

        it( 'may start with text and end with an expression', function() {
            expect( interpolate( 'abc{{123}}' ) ).to.equal( 'abc123' );
        });

        it( 'may start with an expression and end with text', function() {
            expect( interpolate( '{{123}}abc' ) ).to.equal( '123abc' );
        });

        it( 'may start with text, end with text, and have one expression in the middle', function(){
            expect( interpolate( 'abc{{123}}abc{{123}}abc' ) ).to.equal( 'abc123abc123abc' );
        });
        
        it( 'may be "[text][expr][expr][text]"', function() {
            expect( interpolate( 'abc{{123}}{{123}}abc' ) ).to.equal( 'abc123123abc' );
        });

        it( 'may be "[text][expr][text][expr][text]"', function() {
            expect( interpolate( 'abc{{123}}abc{{123}}abc' ) ).to.equal( 'abc123abc123abc' );
        });

        it( 'treats an invalid expression as plain text', function() {
            expect( interpolate('abc{{123+ nothing of any particular value {{123}}')).to.equal("abc{{123+ nothing of any particular value 123" );
            expect( interpolate('abc{{123+}}abc')).to.equal("abc{{123+}}abc" );
        });

        it( 'handles opening brackets with no closing brackets', function() {
            expect( interpolate( 'abc{{123' )).to.equal( "abc{{123" );
        });

        it( 'ignores closing brackets with no opening brackets', function() {
            expect( interpolate( 'abc}}123' )).to.equal( 'abc}}123' );
        });

    });

    context( 'Missing dependency', function() {

        it( 'returns null', function() {
            expect( interpolate( '{{missing}}' )).to.equal( 'null' );
        });

    });

    context( 'Value returned is undefined', function() {
        it( 'returns undefined', function() {
            expect( interpolate( '{{undef}}', {undef:undefined} ) ).to.equal( 'undefined' );
        });
    });

    context( 'Value returned is a Symbol', function() {
        it( 'returns Symbol(name)', function() {
            expect( interpolate( '{{s}}', {s:Symbol('foo')})).to.equal( 'Symbol(foo)' );
        });
    });

    context( 'with wrapper function', function() {
        it( 'should filter/wrap the expressions as expected', function() {
            expect( interpolate( 'abc{{123}}xyz', {}, (e,v,a) => `[${v}]` ) ).to.equal( 'abc[123]xyz' );
        })
    });

});