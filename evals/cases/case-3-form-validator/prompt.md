# Eval Case 3: Interactive Web Form with Real-Time Validation

Build a responsive HTML/CSS/JavaScript client-side registration form with comprehensive real-time and submit-time validation.

Requirements:
1. Fields:
   - `username`: Required, 3–20 alphanumeric characters, must not match reserved words (`admin`, `root`, `support`).
   - `email`: Required, valid RFC-compliant email address structure.
   - `password`: Required, minimum 8 characters, at least one uppercase letter, one lowercase letter, one digit, and one symbol.
   - `confirmPassword`: Must match `password` identically.
   - `termsAccepted`: Checkbox, must be checked before submission.
2. Architecture & UX:
   - Clean Separation: Decouple the pure validation schema/logic engine (`src/validation.js`) from DOM manipulation and rendering (`src/form-ui.js`).
   - Real-time debounced feedback on `blur` and `input` events.
   - Accessible DOM: Appropriate `aria-invalid`, `aria-describedby`, and error announcement attributes.
3. Testing:
   - Exhaustive unit test suite covering the validation rule engine across valid and edge-case invalid inputs.
   - Integration / DOM test verifying form submit prevention on invalid data.
