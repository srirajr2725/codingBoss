# Testing Checklist for College Test Management System

## Frontend Testing

### 1. Login & Authentication
- [ ] User can login with valid credentials
- [ ] Error message displays for invalid credentials
- [ ] Password field is masked correctly
- [ ] Forgot password functionality works (if implemented)
- [ ] Session persists across page refresh
- [ ] User is redirected to login if session expires
- [ ] Email validation works
- [ ] Password requirements are displayed

### 2. MCQ Test Functionality
- [ ] Categories load correctly on test page
- [ ] Subtypes load when category is selected
- [ ] User cannot start test if already completed
- [ ] Timer counts down correctly (3600 seconds = 60 minutes)
- [ ] Questions load with all options visible
- [ ] Answer selection works (single and multiple)
- [ ] Answer is saved when selected
- [ ] Previous/Next navigation works
- [ ] Question palette shows status (answered/unanswered/current)
- [ ] Auto-next feature works when enabled
- [ ] Can mark for review feature
- [ ] Submit test shows confirmation dialog
- [ ] Can review before final submission
- [ ] Score is calculated correctly after submission
  - Formula: (Correct Answers / Total Questions) × 100
- [ ] Results page displays score with percentage
- [ ] Results show breakdown: correct/incorrect/unattempted
- [ ] User cannot retake completed test
- [ ] Browser back button handled correctly

### 3. Coding Test Functionality
- [ ] Programming questions load with problem description
- [ ] Language dropdown shows all supported languages
- [ ] Code editor loads with boilerplate code
- [ ] Code can be typed/edited in editor
- [ ] Syntax highlighting works
- [ ] Run button executes code
- [ ] Test cases display with input/expected output
- [ ] Run test cases shows:
  - [ ] Green checkmark for passed cases
  - [ ] Red X for failed cases
  - [ ] Execution time
  - [ ] Actual vs expected output for failed cases
- [ ] Passing testcases counter updates correctly
- [ ] Submit test button disabled until at least one attempt
- [ ] Score calculated as: (Passed Testcases / Total Testcases) × 100
- [ ] Results show testcase breakdown
- [ ] User cannot retake completed test
- [ ] Code is stored when submitted

### 4. Results/Score Display
- [ ] Results page loads after test submission
- [ ] Score displays prominently
- [ ] Pass/Fail status shows correctly (≥60% = Pass)
- [ ] Test details show:
  - [ ] Test type (MCQ/Coding)
  - [ ] Category
  - [ ] Subtype
  - [ ] Time taken
- [ ] For MCQ results:
  - [ ] Shows correct count
  - [ ] Shows incorrect count
  - [ ] Shows unattempted count
  - [ ] Progress bar shows percentage
- [ ] For Coding results:
  - [ ] Shows passed testcases count
  - [ ] Shows failed testcases count
  - [ ] Shows score per testcase
  - [ ] Shows input/expected/actual for failed cases
- [ ] Back button works
- [ ] Dashboard button works
- [ ] Results persist after navigation

### 5. Test Blocking/Completion
- [ ] Completed test is marked in database
- [ ] User sees "Test Already Completed" message when trying to retake
- [ ] Completed test shows "Completed" button (not "Start")
- [ ] Cannot click start button for completed tests
- [ ] Completed tests are visually distinct from pending

### 6. Navigation & UI
- [ ] Navbar displays correctly
- [ ] All navigation links work
- [ ] Mobile responsive (tested on 320px, 768px, 1024px widths)
- [ ] Loading spinners show appropriately
- [ ] Error messages display with proper styling
- [ ] Success messages display and auto-hide
- [ ] No console errors
- [ ] No memory leaks (check with DevTools)

### 7. Form Validation
- [ ] Empty answers cannot be submitted
- [ ] Empty code cannot be submitted
- [ ] Confirmation dialogs appear before submission
- [ ] Error messages are clear and actionable
- [ ] Required fields are marked
- [ ] Email validation works
- [ ] Password confirmation matches

### 8. Data Persistence
- [ ] Answers are saved as user progresses (MCQ)
- [ ] Code is saved as user types (Coding)
- [ ] Session doesn't expire during test (if timer is long)
- [ ] Tab switching is handled (warning or blocking)
- [ ] Browser refresh doesn't lose progress
- [ ] localStorage is used for backup

---

## Backend Testing

### 1. API Endpoint Testing

#### Check Test Completion
```bash
GET /api/https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/check-test-completed/?user_id=X&subtype=Java&type=Technical
```
- [ ] Returns `is_completed: true` for completed tests
- [ ] Returns `is_completed: false` for new tests
- [ ] Includes score and percentage in response
- [ ] Handles invalid user_id gracefully
- [ ] Requires authentication token

#### Mark Test Completed
```bash
POST /api/https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/mark-test-completed/
```
- [ ] Accepts user_id, subtype, type, score, total_questions
- [ ] Creates record in database
- [ ] Returns success response with timestamp
- [ ] Prevents duplicate marking (idempotent)
- [ ] Validates score ≤ total_questions
- [ ] Requires authentication token

#### Evaluate MCQ
```bash
POST /api/https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/evaluate/
```
- [ ] Accepts answers object
- [ ] Calculates correct answers
- [ ] Returns score and percentage
- [ ] Returns question-wise results
- [ ] Marks test as completed
- [ ] Stores result in database
- [ ] Prevents re-evaluation after submission

#### Submit Coding Test
```bash
POST /api/https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/questions/submit/
```
- [ ] Accepts source code and testcase results
- [ ] Calculates passed testcases
- [ ] Returns score breakdown per testcase
- [ ] Stores submission in database
- [ ] Marks test as completed
- [ ] Prevents duplicate submission

### 2. Database Testing

#### MCQResult Table
- [ ] Records are created on submission
- [ ] User_id is stored correctly
- [ ] Score matches calculation
- [ ] Timestamp is recorded
- [ ] Unique constraint prevents duplicates
- [ ] All required fields are populated

#### CodingResult Table
- [ ] Records are created on submission
- [ ] Source code is stored
- [ ] Testcase results are linked
- [ ] Score matches calculation
- [ ] All testcases are recorded

#### TestCase Table (Coding)
- [ ] Testcases linked to questions
- [ ] Input/output stored correctly
- [ ] Score value reflects difficulty
- [ ] Hidden testcases marked correctly

### 3. Authentication & Authorization
- [ ] Endpoints require valid token
- [ ] Invalid token returns 401
- [ ] Expired token returns 401
- [ ] User cannot access other user's data
- [ ] Admin can access all data
- [ ] CORS headers are set correctly

### 4. Performance Testing
- [ ] API responds in <500ms for simple queries
- [ ] Large result sets paginated (if applicable)
- [ ] Database queries optimized (no N+1)
- [ ] Upload size limited to 5MB
- [ ] Rate limiting is working
- [ ] Connection pooling configured

### 5. Error Handling
- [ ] 400: Bad request returns validation errors
- [ ] 401: Unauthorized returns clear message
- [ ] 403: Forbidden returns permission error
- [ ] 404: Not found returns resource error
- [ ] 500: Server error returns generic message
- [ ] Errors logged to console/file

---

## Integration Testing

### 1. End-to-End MCQ Test Flow
- [ ] User can complete full MCQ test cycle:
  1. Navigate to test page
  2. Select category
  3. Select subtype
  4. Start test
  5. Answer questions
  6. Submit test
  7. View results
- [ ] All data is persisted correctly
- [ ] Test blocking works after completion

### 2. End-to-End Coding Test Flow
- [ ] User can complete full coding test cycle:
  1. Navigate to assignments
  2. Select coding question
  3. Write code
  4. Run test cases
  5. Submit solution
  6. View results
- [ ] Code is stored with results
- [ ] Testcase results are accurate

### 3. Score Calculation Accuracy
- [ ] MCQ: (4/10) = 40%
- [ ] MCQ: (8/10) = 80%
- [ ] Coding: (3/5) = 60%
- [ ] Coding: (5/5) = 100%
- [ ] Scores correctly determined Pass/Fail

### 4. User Role Testing
- [ ] Student can take tests
- [ ] Student cannot upload questions
- [ ] Admin can upload questions
- [ ] Admin can view all results
- [ ] Trainer can view trainee results
- [ ] Role-based access control works

---

## Browser & Device Testing

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Devices
- [ ] iPhone 12 (375px)
- [ ] iPad (768px)
- [ ] Android phone (360px)
- [ ] Android tablet (1024px)

### Responsive Elements
- [ ] Navbar collapses to hamburger menu
- [ ] Content stacks vertically on mobile
- [ ] Forms are touch-friendly
- [ ] Buttons are at least 44x44px
- [ ] Text is readable (font size ≥ 16px)

---

## Security Testing

- [ ] XSS: User input is sanitized
- [ ] SQL Injection: Parameterized queries used
- [ ] CSRF: CSRF tokens implemented
- [ ] Authentication: Secure token storage
- [ ] Password: Hashed and salted
- [ ] HTTPS: All communications encrypted
- [ ] Rate limiting: Enabled on API
- [ ] File upload: Type and size validation
- [ ] Logging: Sensitive data not logged

---

## Performance Testing

### Load Testing
- [ ] System handles 100 concurrent users
- [ ] System handles 1000 concurrent users
- [ ] API response time <500ms under load
- [ ] Database connection pool adequate

### Stress Testing
- [ ] Server gracefully handles overload
- [ ] Requests queue properly
- [ ] No data corruption under stress
- [ ] Recovery is automatic

---

## Accessibility Testing

- [ ] Color contrast meets WCAG AA
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Form labels associated with inputs
- [ ] Error messages associated with fields
- [ ] Focus indicators visible
- [ ] Alt text on images

---

## Bug Reporting Template

When you find a bug, please document:

```
Title: [Brief description]
Severity: Critical/High/Medium/Low
Browser: [e.g., Chrome 96 on Windows 10]
Steps to Reproduce:
1. Step 1
2. Step 2
3. Step 3

Expected Behavior:
[What should happen]

Actual Behavior:
[What actually happens]

Screenshots: [If applicable]
Console Errors: [Copy of error messages]
```

---

## Sign-Off Checklist

Before deploying to production:

- [ ] All critical bugs fixed
- [ ] All high-priority bugs fixed
- [ ] Performance acceptable
- [ ] Security vulnerabilities addressed
- [ ] Database migrations applied
- [ ] Backup procedure tested
- [ ] Rollback procedure documented
- [ ] User documentation updated
- [ ] Admin documentation updated
- [ ] Training completed for support team

