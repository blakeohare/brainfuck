// Problem #191: https://leetcode.com/problems/number-of-1-bits/submissions/
let countOnes = (n) => {
    
    // insert impl-js/programs.js
    // insert impl-js/brainfuck.min.js
    let { flattenCode, countBits } = PROGRAMS;

    let program = flattenCode([
        '[->>>>+<<<<]', // shift the first byte to the end, leaving an empty space
        '>>>>>', // move just after the last byte
        countBits,
        '<[-<<<<+>>>>]', // add it to the first memory slot
        countBits,
        '<[-<<<+>>>]', // add it to the first memory slot
        countBits, 
        '<[-<<+>>]', // add it to the first memory slot
        countBits, 
        '<[-<+>]', // add it to the first memory slot.
        // First memory slot now has the number of 1's as an 8-bit number.
    ]);

    return BrainFuck()
        .setInt32(n, 0)
        .setCode(program)
        .run()
        .getInt8(0);
}; 
