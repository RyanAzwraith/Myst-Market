# Pytest Conventions

- do not run the tests. test output will be supplied when needed
- Reuse the utilies in the /tests/utils.py file
- always mock the interface implementations. Unless testing the implmentations themselves. Avoid mocking other dependencies unless necessary
- Focusing on high value tests of meaningful behaviour, important edge cases, error states and likely sources of bugs.  Use judgement, do not be pedantic.
- When testing something only test behaviour directly controlled by it.  Do not retesting the behave of its dependencies.
- avoid redundant assertions and tests that do not add coverage
- for pytest to disocver the tests, test names including the functions, classes and files all must end in \_test
- prefer making factories for any objects in a fixtures file

## Structure

- unit and intergration tests are combined
- Every testable file containing meaningful behaviour should have a corresponding test file with the same name
- Every meaningful function or class should have a corresponding class containing its tests.
- Mark each test class with an  intimacy level: low, medium or high.
- The first test in each describe block must be named "functionality" and verify representative, general usage. Follow it with tests for specific cases, edge cases, and error states as appropriate.
- each test folder will have a shared fixtures.py file that has all of the fixtures

## Intimacy

Intimacy measures how integrated the behaviour under test is with its dependencies. Shared utilities, and common infrastructure do not count towards the intimacy level.

- **Low:** Self-contained behaviour with no meaningful dependencies.
- **Medium:** Behaviour that depends on one or a few external dependencies
- **High:** Behaviour that coordinates several dependencies or multiple layers of the application.

Assign intimacy levels based on the actual integration required, not simply the number of imports.

## Test-First Debugging Workflow

- The source code is still in development and may contain bugs. Tests should expose these bugs by checking expected behaviour.
- Tests must verify the expected behaviour defined by the requirements, not simply reproduce the current implementation's behaviour.
- A failing test is not, by itself, a reason to weaken the test or change the implementation.
- **During the testing phase, modify test files only. Do not edit source code.** Bugs will be fixed separately when explicitly requested.
- When reviewing supplied test output, distinguish between an incorrect test or assumption, a test setup or environment problem, and a source code bug. Explain the reasoning when the cause is uncertain.
