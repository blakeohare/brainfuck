const runTests = () => {

  runTest("add 2", [7, 42], [49], '>>' + PROGRAMS.add);
  runTest("add 3", [5, 22, -6], [21], '>>>' + PROGRAMS.add3);
  runTest("toBool 4", [4], [true], '>' + PROGRAMS.toBool);
  runTest("toBool 0", [0], [false], '>' + PROGRAMS.toBool);
  runTest("toBool -121", [-121], [true], '>' + PROGRAMS.toBool);
  runTest("sign 4", [4], [1], '>' + PROGRAMS.sign);
  runTest("sign 0", [0], [0], '>' + PROGRAMS.sign);
  runTest("sign -121", [-121], [-1], '>' + PROGRAMS.sign);
  runTest("and T T", [true, true], [true], '>>' + PROGRAMS.and);
  runTest("and T F", [true, false], [false], '>>' + PROGRAMS.and);
  runTest("and F T", [false, true], [false], '>>' + PROGRAMS.and);
  runTest("and F F", [false, false], [false], '>>' + PROGRAMS.and);
  runTest("or T T", [true, true], [true], '>>' + PROGRAMS.or);
  runTest("or T F", [true, false], [true], '>>' + PROGRAMS.or);
  runTest("or F T", [false, true], [true], '>>' + PROGRAMS.or);
  runTest("or F F", [false, false], [false], '>>' + PROGRAMS.or);
  runTest("multiply 7 8", [7, 8], [56], '>>' + PROGRAMS.multiply);
  runTest("duplicate 51", [51], [51, 51], '>' + PROGRAMS.duplicate);
  runTest("duplicate string buffer", ["cat"], ["cat", 0, 0, "cat"], PROGRAMS.duplicateStringBuffer(6));
  runTest("swap 3 7", [3, 7], [7, 3], '>>' + PROGRAMS.swap);
  runTest("range 5", [5], [1, 2, 3, 4, 5, 0, 0, 0, 0, 0], '>' + PROGRAMS.range);
  runTest("8 mod 2", [8], [0], '>' + PROGRAMS.mod2);
  runTest("9 mod 2", [9], [1], '>' + PROGRAMS.mod2);
  runTest("-91 mod 2", [-91], [1], '>' + PROGRAMS.mod2);
  runTest("-48 mod 2", [-48], [0], '>' + PROGRAMS.mod2);
  runTest("count bits 42", [42], [3], '>' + PROGRAMS.countBits);
  runTest("count bits 51", [51], [4], '>' + PROGRAMS.countBits);
  runTest("count bits -7", [-7], [6], '>' + PROGRAMS.countBits);

};
