const BrainFuck = () => {
  let logger = (...args) => console.log(...args);
  let program = [];
  let jumpTargets = [];
  let memory = [];
  for (let i = 0; i < 30000; i++) {
    memory.push(0);
  }

  let compileOptimized = (code) => {
    let chars = code.split('');
    let buffer = [];
    for (let char of chars) {
      switch (char) {
        case '<':
        case '>':
        case '+':
        case '-':
          if (buffer.length && buffer[buffer.length - 1].type === char) {
            buffer[buffer.length - 1].amount++;
          } else {
            buffer.push({ type: char, amount: 1});
          }
          break;
        default:
          buffer.push({ type: char, target: null, hasNestedJump: false });
          break;
      }
    }
    
    for (let i = 0; i < buffer.length; i++) {
      
      if (buffer[i].type === '[' && i + 4 < buffer.length) {
        let next5 = buffer.slice(i + 1, i + 6).map(o => o.type).join('');
        let isHit = false;
        if (buffer[i + 1].amount === 1) {
          if (next5 === '->+<]') {
            buffer[i] = { type: 'ADD-MOVE', dest: buffer[i + 2].amount, jump: 5, factor: buffer[i + 3].amount };
            isHit = true;
          } else if (next5 === '-<+>]') {
            buffer[i] = { type: 'ADD-MOVE', dest: -buffer[i + 2].amount, jump: 5, factor: buffer[i + 3].amount };
            isHit = true;
          }
        }
        if (isHit) {
          for (let j = 0; j < 5; j++) {
            buffer[i + 1 + j] = { type: 'NOOP' };
          }
        }
      }
    }

    let jumpStack = [];
    for (let i = 0; i < buffer.length; i++) {
      if (buffer[i].type === '[') {
        jumpStack.push(i);
      } else if (buffer[i].type === ']') {
        if (jumpStack.length) {
          let j = jumpStack.pop();
          buffer[j].target = i;
          buffer[i].target = j;
        } else {
          throw new Error();
        }
      }
    }    
    if (jumpStack.length) throw new Error();

    return buffer;
  };

  let setCode = (code) => {
    let validChars = new Set('-+<>[]*'.split(''));
    let rawCode = code.split('').filter(c => validChars.has(c)).join('');
    program = compileOptimized(rawCode);

    return bf;
  };

  let setString = (str, offset) => {
    let target = offset;
    for (let i = 0; i < str.length; i++) {
      memory[target++] = str.charCodeAt(i);
    }
    memory[target] = 0; // null-term
    return bf;
  };

  let setInt8 = (n, offset) => {
    memory[offset] = n & 255;
    return bf;
  };

  let setInt32 = (n, offset) => {
    memory[offset + 3] = n & 255;
    n >>= 8;
    memory[offset + 2] = n & 255;
    n >>= 8;
    memory[offset + 1] = n & 255;
    n >>= 8;
    memory[offset] = n & 255;
    return bf;
  };

  let run = () => {

    let pc = 0;
    let mc = 0;
    let plen = program.length;

    while (pc < plen) {
      let op = program[pc];
      switch (op.type) {
        case 'NOOP': break;

        case '+':
          memory[mc] = (memory[mc] + op.amount) & 255;
          break;
        case '-':
          memory[mc] = (memory[mc] - op.amount) & 255;
          break;
        case '<':
          mc -= op.amount;
          break;
        case '>':
          mc += op.amount;
          break;
        case '[':
          if (!memory[mc]) {
            pc = op.target;
          }
          break;
        case ']':
          if (memory[mc]) {
            pc = op.target - 1;
          }
          break;
        
        case 'ADD-MOVE':
          memory[mc + op.dest] = (memory[mc + op.dest] + memory[mc] * op.factor) & 255;
          memory[mc] = 0;
          pc += op.jump;
          break;

        case '*':
          logger(`PC: ${pc}, MC: ${mc}`, memory.slice(0, 20), memory);
          break;
      }
      pc++;
    }

    return bf;
  };

  let setLogger = fn => { logger = fn; };

  let getString = (offset) => {
    let buffer = [];
    for (let i = offset; memory[i] !== 0; i++) {
      buffer.push(String.fromCharCode(memory[i]));
    }
    return buffer.join('');
  };

  let getInt8 = (offset) => {
    return memory[offset] & 255;
  };

  let getInt32 = (offset) => {
    return (
      (memory[offset] << 24) |
      (memory[offset + 1] << 16) |
      (memory[offset + 2] << 8) |
      memory[offset + 3]
    );
  };

  let bf = {
    setCode,
    setString,
    setInt8,
    setInt32,
    run,
    setLogger,
    getString,
    getInt8,
    getInt32
  };

  return Object.freeze(bf);
};
