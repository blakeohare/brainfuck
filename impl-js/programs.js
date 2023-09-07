const PROGRAMS = (() => {

  // Pop two numbers and push the result
  // SLOT -2: NUM 1 and RESULT
  // SLOT -1: NUM 2
  // SLOT 0: TMP
  let add = [
    '<<', // move to NUM 1
    '[->>+<<]', // move NUM 1 to TMP
    '>', // move to NUM 2
    '[->+<]', // add NUM 2 to TMP
    '>', // move to TMP
    '[-<<+>>]', // move TMP to RESULT
    '<' // move to SLOT -1, as this is the new top of the stack.
  ];

  // Pop 3 numbers and push the result
  let add3 = [add, add];

  // STACK: VAL TMP
  // convert current memory slot to 0 or 1 based on whether or not it's non-zero.
  let toBool = [
    '<',
    '[', // skip entire instruction if already zero
      '[-]', // zero-out existing value if present
      '>+<', // make TMP slot 1 to indicate this code ran. VAL must be 0 to stop outer loop.
    ']',
    '>[-<+>]<' // shift TMP slot back down to VAL slot
  ];

  // Convert a number value to -1, 0, or 1 depending on its sign.
  // SLOT 0: VALUE/RESULT
  // SLOT 1: TMP: SIGNED-BIT
  // SLOT 2: TMP: DOUBLE-VALUE (signed bit overflows and is truncated)
  // SLOT 3: TMP: NON-ZERO-BIT
  let sign = [
    '<', // move to input

    '[',
      // set the non-zero bit if there was any value in the initial slot.
      '>>>+<<<',

      // copy the value to the signed-bit and double-value slots. Add 2 when
      // copying to the double slot. This effectively truncates the signed bit.
      '[->+>++<<]',

      // move to the double-value slot with the truncated signed bit.
      '>>',

      // Because this number is even, we can subtract by 2 to get down to 0.
      // Each time we do this, subtract 1 from the copied bit. This leaves ONLY
      // the signed bit in slot 1.
      '[--<->]',
    ']',

    // Double-value is now 0 and no longer needed.

    // move to the signed bit slot
    '<',

    // If the signed bit slot has any value, that means this was a negative
    // number. Clear this slot and assign -2 to the result slot.
    '[[-]<-->]',

    // At this point, the result slot contains 0 if it was positive or zero, or
    // it contains -2 if it was negative. To convert this to -1, 0, and 1, we
    // take the non-zero bit and add it directly to the result.

    '>>', // move to non-zero bit
    '[-<<<+>>>]', // if it's set, copy it to the result slot

    '<<', // move to top of stack
  ];

  // Pops two numbers and pushes a false if they were both true
  let nand = [
    // clear out the 2nd number and add 1 to TMP space
    '<',
    '[[-]>+<]',

    // clear out the 1st number and add 1 to TMP space
    '<',
    '[[-]>>+<<]',

    // subtract 2 from TMP space, it is now 0 iff both inputs were non-zero, -1 or -2 otherwise
    '>>--',

    // if anything is present in TMP, clear it out and add 1 to RESULT
    '[[+]<<+>>]',

    '<', // move to top of stack
  ];

  // pops a number and pushes 0 if it was non-zero, or 1 if it was 0
  let not = [
    '<', // pop
    '[[-]>+<]', // clear it out if anything is present, and if so, set TMP slot to 1
    '+', // set the result slot to 1 unconditionally
    '>[[-]<->]', // subtract the TMP slot from the result slot
  ];

  // Pops two numbers and pushes a true if they were both true
  let and = [nand, not];

  // Pops two numbers and pushes a true if either were true.
  let or = [
    '<', // Go to num 2
    '[[-]>+<]', // Clear it and add a bit to TMP

    '<', // Go to num 1
    '[[-]>>+<<]', // Clear it and add a bit to TMP

    '>>', // Go to TMP
    '[[-]<<+>>]', // Clear it and if anything was present, add a bit to RESULT

    '<', // Go to top of stack.
  ];

  // pop two presumably positive numbers and multiply them
  let multiply = [
    // SLOT -2: A / RESULT
    // SLOT -1: B
    // SLOT 0: A-COPY
    // SLOT 1: OUTPUT-TMP

    '<', // go to B
    '[-', // for each B
      '<', // go to A
      '[->>+>+<<<]', // add it to A-COPY and to OUTPUT-TMP
      '>>[-<<+>>]', // move A-COPY back to A
      '<', // go to B to start loop again
    ']',

    // B is now eliminated, A-COPY should be 0. The result is in OUTPUT-TMP
    // but A still has a value. Eliminate it
    '<', // go to A
    '[-]', // clear

    // copy OUTPUT-TMP to RESULT
    '>>>', // go to OUTPUT-TMP
    '[-<<<+>>>]', // move it to A

    '<<', // go to top of stack.
  ];

  // pop the current item and push it twice
  // SLOT -1: VALUE (unmodified)
  // SLOT 0: RESULT (copy)
  // SLOT 1: TMP
  let duplicate = [
    '<', // pop
    '[->>+<<]', // move it to TMP space
    '>>', // go to TMP space
    '[-<+<+>>]', // for each value, add it back to the previous two slots

    // no need to shift, TMP slot is the new top of the stack.
  ];

  let notInline = '>' + not + '<';

  let duplicateStringBuffer = sz => {
    return [
      // copy the value to +size offset away AND another copy +2*size away
      // until you encounter the first 0.
      '[[-' + '>'.repeat(sz) + '+' + '>'.repeat(sz) + '+' + '<'.repeat(sz * 2) + ']>]',

      // We don't know how far into the buffer we are, BUT we know the first
      // non-zero value will be the beginning of the copied data. While we see
      // 0's, move forward. This will stop at the first non-zero value
      notInline,
      '[->' + notInline + ']',

      // We are now at the beginning of the first copied buffer.
      // Clear out the buffer entirely, ending at the 2nd copied buffer.
      '[-]>'.repeat(sz),

      // We are now at the beginning of the second copied buffer with only
      // zero's behind us. Copy it twice to the previous slots.
      ('[-' + '<'.repeat(sz) + '+' + '<'.repeat(sz) + '+' + '>>'.repeat(sz) + ']>').repeat(sz),

      // Move to the end of the 2nd buffer
      '<'.repeat(sz),
    ]
  };

  let swap = [
    '<',
    '[->+<]',
    '<',
    '[->+<]',
    '>>[-<<+>>]',
  ];

  // e.g. OFFEST = 2:
  // mem pointer starts at the slot just after the OFFSET
  // A, B, C, D, E, OFFSET, 0's...
  // A, B, C, 0, 0, 0, D, E, 0's...
  let insertZeroAtOffset = [

    // Go to offset
    '<',

    // While the offset is non zero...

    // We shift 3 slots for each iteration

    // A, A, A, OFFSET, RET, ZERO, A, A, ....
    '[',
      '-', // subtract 1 from OFFSET
      '<', // go to the previous value
      '[->>>+<<<]', // and move it three slots later (which is the zero slot)
      '>>+<<', // add 1 to the middle slot of the three. This is our return counter.
      '<[-<+>]', // go back to the offset and move it down by 1
      '>[-<+>]', // also move the return counter down by 1
      '<<', // go to the offset
    ']',

    // At this point we are now pointing at the offset which is zero, and the slots
    // look like this:
    // ..., A, A, A, 0, RETURN-COUNTER, 0, A, A, A, ...

    '>', // go to the return counter

    '[->+<]>', // and shift it up by 1

    // ..., A, A, A, INSERTED-ZERO, 0, RET, A, A, A, ...
    // This next part will basically leap frog the next value over the return
    // counter and shift it up by one, while decrementing the return counter

    '[',
      '-', // we decrement the return counter
      '>[-<<+>>]', // leap frog the next value down by 2 slots
      '<[->+<]', // shift the return value up by one slot
      '>', // go to the return counter for the next iteration
    ']',

    // At this point the memory counter is pointing 2 slots after the end of the stack,
    '<', // go to the previous slot, which is the true end of the stack.
  ];

  // VALUE,
  // 1, 2, 3, 4, ..., VALUE
  let range = [
    '<', // go to value
    '[->>>+<<<]', // shift it up by 3
    // It now looks like this: 0, 0, 0, VALUE

    // These are used as such: NEXT-OUTPUT, TMP, PREV-OUTPUT, COUNTER

    // Go to COUNTER
    '>>>',

    // while the counter is non-zero
    '[',

      '-', // decrement

      // Copy PREV-OUTPUT + 1 into TMP and NEXT-OUTPUT
      '<+[-<+<+>>]',

      // Move the counter up by one
      '>[->+<]',

      // Move TMP to where COUNTER used to be
      '<<[->>+<<]',

      // Move to the new COUNTER
      '>>>',
    ']',

    // we're done, clear out PREV-OUTPUT
    '<[-]',
    '<<', // And move to the top of the stack

  ];

  let mod2 = [
    '>--', // push 0 and 254
    '[-->+<]', // pop the 254 values 2 at a time and push 1 to the next slot, to create 0, 0, and 127
    '>+', // add 1, so now you have NUM, 0, 0, 128

    // We're now going to treat this as a sort of multiply operation. By doing
    // so, we are effectively performing a bit-shift-left-by-7 operation which
    // will truncate all bits except the least-significant.

    '[-', // while our counter (multiplier) is non-zero
      '<<<', // go to the NUM slot
      '[->+>+<<]', // subtract the NUM slot and copy it to the next two TMP slots
      '>[-<+>]', // subtract-and-add the first TMP slot to the original NUM slot
      '>>', // go back to the MULTIPLIER slot to repeat the loop
    ']',

    // At this point we are left with the following:
    // NUM, 0, NUM<<7, 0

    '<<<[-]', // clear out the num slot
    '>>', // Go to the NUM<<7 slot
    '[[-]<<+>>]', // If there's any value in there, clear it out and mark the original NUM slot with a 1

    '<', // go to the top of the stack
  ];

  let countBits = [
    // NUM --> 0 (TALLY), NUM, TMP1, TMP2
    '<[->+<]', // Move NUM to the right by one

    '>', // go to NUM slot
    '[', // while it is non-zero
      '[->+>+<<]', // copy it to TMP1 and TMP2
      '>>>', // go to just after TMP2
      mod2, // run mod2
      '<', // go to the mod2 result bit in TMP2
      '[-<-<<+>>>]', // if it is set, subtract 1 from TMP1 (the odd number, and add 1 to TALLY)
      '<[--<+>]', // go to TMP1 and divide it in half and copy it back to NUM
      '<', // move back to NUM in preparation for repeating the loop.
    ']',
  ];

  let flattenCode = code => {
    let flat = [];
    let impl = (arrOrStr) => {
      if (Array.isArray(arrOrStr)) arrOrStr.forEach(impl);
      else flat.push(arrOrStr);
    };
    impl(code);

    flat.push(' ');

    let chars = flat.join('').split('');
    let buffer = [];
    let currentOffset = 0;
    let inOffset = false;
    for (let i = 0; i < chars.length; i++) {
      let c = chars[i];
      let isShiftUp = c === '>';
      let isShiftDown = c === '<';
      let isShift = isShiftUp || isShiftDown;

      if (inOffset) {
        if (isShift) {
          currentOffset += isShiftUp ? 1 : -1;
        } else {
          if (currentOffset === 0) {
            // do nothing
          } else if (currentOffset > 0) {
            buffer.push('>'.repeat(currentOffset));
          } else {
            buffer.push('<'.repeat(-currentOffset));
          }
          inOffset = false;
          i--;
        }
      } else {
        if (isShift) {
          currentOffset = 0;
          inOffset = true;
          i--;
        } else {
          buffer.push(c);
        }
      }
    }

    return buffer.join('').trim();
  };

  let programs = {
    add,
    add3,
    and,
    countBits,
    duplicate,
    duplicateStringBuffer,
    flattenCode,
    insertZeroAtOffset,
    mod2,
    multiply,
    nand,
    not,
    notInline,
    or,
    range,
    sign,
    swap,
    toBool,
    mod2,
  };

  return Object.freeze(
    Object.keys(programs).reduce(
      (lookup, k) => {
        let value = programs[k];
        lookup[k] = (typeof value === 'function')
          ? (...args) => flattenCode(value(...args))
          : flattenCode(value);
        return lookup;
      },
      {}));

})();
