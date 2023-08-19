import { AssertionError } from "assert";
export function testCreateMemorisedFunctionArray() {
  try {
    const regularFunction = (multiplier) => [
      1 * multiplier,
      2 * multiplier,
      3 * multiplier,
    ];

    // test if it would return the same array object as intented when input doesn't change
    const memorisedFunction1 = createMemorisedFunction(
      regularFunction,
      comparingArray
    );
    const input1 = 1;
    const expectedOutput1 = [1, 2, 3];
    const output1 = memorisedFunction1(input1);
    const output1Same = memorisedFunction1(input1);
    if (
      output1[0] !== expectedOutput1[0] ||
      output1[1] !== expectedOutput1[1] ||
      output1[2] !== expectedOutput1[2]
    ) {
      throw new AssertionError({
        message: "testcase1 faild invalid element value",
      });
    } else if (output1 !== output1Same) {
      throw new AssertionError({
        message:
          "testcase1 faild: same input with two array with different reference",
      });
    }

    // test if the second call with different input would return the correct value
    const memorisedFunction2 = createMemorisedFunction(
      regularFunction,
      comparingArray
    );
    memorisedFunction2(1);
    const input3 = 2;
    const expectedOutput3 = [3, 6, 9];
    const output3 = memorisedFunction2(input3);
    if (
      output3[0] !== expectedOutput3[0] ||
      output3[1] !== expectedOutput3[1] ||
      output3[2] !== expectedOutput3[2]
    ) {
      throw new AssertionError({
        message: "testcase2 faild invalid element value",
      });
    }
    return true;
  } catch (error) {
    return false;
  }
}