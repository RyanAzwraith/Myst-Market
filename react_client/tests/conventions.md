# Vitest Conventions

- do not run the tests. test output will be supplied when needed
- Reuse the utilies in the /tests/utils.tsx file and the object factories in the /mock_data folder
- always mocked the server implementation, avoid mocking other dependencies unless necessary
- Focusing on high value tests of meaningful behaviour, important edge cases, error states and likely sources of bugs.  Use judgement, do not be pedantic.
- do not retesting the behave of child elements or dependencies, only test behaviour directly controlled from the component
- avoid redundant assertions and tests that do not add coverage
- prefer using userEvent imported from "@testing-library/user-event" for tests that simulate user interaction

## Structure

- unit and intergration tests are combined
- Every testable file containing meaningful behaviour should have a corresponding test file with the same name and a .test extension
- Every meaningful function, component, hook, or class should have a corresponding describe block containing its tests.
- Name each describe block using the format [name] intimacy: [low|medium|high].
- The first test in each describe block must be named "functionality" and verify representative, general usage. Follow it with tests for specific cases, edge cases, and error states as appropriate.

## Intimacy

Intimacy measures how integrated the behaviour under test is with its feature-level dependencies. Shared components, shared utilities, and common infrastructure do not count towards the intimacy level.

- **Low:** Self-contained behaviour with no meaningful feature-level dependencies.
- **Medium:** Behaviour that depends on one or a few feature-level modules, such as hooks or queries.
- **High:** Behaviour that coordinates several feature-level dependencies or multiple layers of the application.

Assign intimacy levels based on the actual integration required, not simply the number of imports.

## Test-First Debugging Workflow

- The source code is still in development and may contain bugs. Tests should expose these bugs by checking expected behaviour.
- Tests must verify the expected behaviour defined by the requirements, not simply reproduce the current implementation's behaviour.
- A failing test is not, by itself, a reason to weaken the test or change the implementation.
- **During the testing phase, modify test files only. Do not edit source code.** Bugs will be fixed separately when explicitly requested.
- When reviewing supplied test output, distinguish between an incorrect test or assumption, a test setup or environment problem, and a source code bug. Explain the reasoning when the cause is uncertain.
