# Quick Start Guide - Test Management System

## What's New?

Your CodingBoss platform now has:
1. **Score Display** - Students see their scores after completing tests
2. **Test Case Management** - Coding tests track pass/fail for each test case
3. **Test Blocking** - Students cannot retake completed tests
4. **Results Page** - Beautiful display of test results with detailed breakdown

---

## For Students

### Taking an MCQ Test

1. **Go to Tests**
   - Click "Tests" from the dashboard or navigation menu

2. **Select Category**
   - Choose from: Technical, Aptitude, or SoftSkill

3. **Select Test**
   - Click on a test subtype (e.g., "Java", "Python")

4. **Answer Questions**
   - Select your answer
   - Use Previous/Next to navigate
   - You can see which questions you've answered in the palette on the right

5. **Submit Test**
   - Click "Submit Test" button
   - Confirm in the dialog
   - Wait for evaluation

6. **View Results**
   - Your score displays immediately
   - See breakdown: correct, incorrect, unattempted
   - See percentage and pass/fail status

### Taking a Coding Test

1. **Go to Assignments**
   - Click "Assignments" from the dashboard

2. **Select a Coding Question**
   - Click "Start" on any programming question
   - Cannot start if already completed (shows "Completed" button)

3. **Write Code**
   - Write your solution in the code editor
   - Choose your language from dropdown

4. **Run Test Cases**
   - Click "Run Test Cases"
   - See which test cases passed/failed
   - Fix your code based on failures

5. **Submit**
   - Click "Submit" when confident
   - Confirm submission
   - Your solution is evaluated

6. **View Results**
   - See score out of total test cases
   - See pass/fail for each test case
   - Cannot retake this question

---

## For Administrators

### Setting Up Test Cases (When Backend is Ready)

1. **Add Testcases to Coding Questions**
   ```
   Go to Question Management
   → Select coding question
   → Click "Manage Test Cases"
   → Add input, expected output, and points for each
   ```

2. **Check Test Completion Status**
   - Dashboard shows which students completed which tests
   - See their scores and dates

3. **Manage Results**
   - View all test results
   - Export results for reporting
   - Track student progress

---

## Important Information

### Test Blocking
- **Once you complete a test, you CANNOT retake it**
- The test will show "Completed" status
- You cannot click the start button
- This prevents cheating and ensures fair assessment

### Score Calculation

**MCQ Tests:**
```
Score = (Correct Answers ÷ Total Questions) × 100

Example: 8 out of 10 correct
Score = (8 ÷ 10) × 100 = 80%
```

**Coding Tests:**
```
Score = (Passed Testcases ÷ Total Testcases) × 100

Example: 4 out of 5 testcases passed
Score = (4 ÷ 5) × 100 = 80%
```

### Passing Score
- **60% or above = PASS** ✅
- **Below 60% = Needs Improvement** ⚠️

---

## Features Overview

### Results Page Shows

#### For MCQ Tests
✅ Your score (e.g., 8/10)
✅ Percentage (80%)
✅ Correct answers count
✅ Incorrect answers count
✅ Unattempted questions
✅ Test category and subtype
✅ Time taken (if recorded)

#### For Coding Tests
✅ Your score (e.g., 4/5 testcases)
✅ Percentage (80%)
✅ Passed testcases
✅ Failed testcases
✅ Details for each testcase:
   - Input provided
   - Expected output
   - Actual output (if failed)
   - Pass/fail status

---

## Frequently Asked Questions

### Q: Why can't I retake a test I completed?
**A:** To ensure fair assessment and prevent cheating. Once you submit a test, it's locked. Your best score is recorded.

### Q: Can I improve my score?
**A:** Different tests may be available on different dates. When new tests are released, you can attempt them. Your cumulative score includes all attempts.

### Q: What if I make a mistake during a test?
**A:** You can review your answers before final submission by clicking "Review" in the confirmation dialog. Once submitted, you cannot change your answers.

### Q: Where are my results saved?
**A:** Results are saved in the system database and visible:
- On the Results page (immediately after test)
- In your Dashboard/Progress
- In your Test History

### Q: How long is my test session?
**A:** MCQ tests typically have a 60-minute timer. Coding tests usually have more time. The timer is shown in the test interface.

### Q: What if I get disconnected during a test?
**A:** Your answers are saved locally. When you reconnect, you can resume from where you left off. However, it's recommended to submit promptly to ensure your answers are saved to the server.

---

## Troubleshooting

### I see "Test Already Completed" message

**Problem:** You've already completed this test and cannot retake it.

**Solution:** 
- Attempt a different test or
- Wait for new tests to be released

### I submitted but don't see my results

**Problem:** Results are processing or not displaying correctly.

**Solution:**
1. Refresh the page
2. Check your Dashboard for the latest results
3. Contact support if still not visible

### My code fails testcases

**Problem:** Your solution doesn't produce the expected output.

**Solution:**
1. Review the failed testcase input and expected output
2. Debug your code
3. Click "Run Test Cases" again
4. Repeat until all pass before submitting

### I'm running out of time

**Problem:** Timer is about to expire.

**Solution:**
1. Answer remaining questions quickly
2. Or leave them blank (you can review before submitting)
3. Submit to save your attempts and see results

---

## Best Practices

### Before Taking a Test
✅ Make sure you have a stable internet connection
✅ Use a computer/laptop (not phone for coding tests)
✅ Close other applications and browser tabs
✅ Find a quiet place without distractions
✅ Keep a notepad for quick notes (if allowed)

### During a Test
✅ Read each question carefully
✅ Manage your time - don't spend too long on one question
✅ For coding: test your code before submitting
✅ Use the Previous/Next buttons to review
✅ Mark questions for review if unsure

### After Test Submission
✅ Check your results immediately
✅ Note areas where you struggled
✅ Prepare better for future tests
✅ Ask instructors for help if needed

---

## Support & Help

### For Technical Issues
- Check your internet connection
- Clear browser cache (Ctrl+Shift+Delete)
- Try a different browser
- Contact IT support

### For Questions About Tests
- Ask your instructor
- Check the test instructions
- Review course materials related to the topics

### For Account Issues
- Reset your password if forgotten
- Verify your email is correct
- Contact admin for account issues

---

## Important Reminders

⚠️ **Academic Integrity**
- Do not share test answers with other students
- Do not copy code from internet during timed tests
- Do not use external help during proctored tests
- Each test is recorded for your learning

⚠️ **Test Completion**
- You will NOT be able to retake completed tests
- Make sure you're ready before clicking "Submit"
- Review your answers before submitting
- Your best attempt is recorded

---

## Ready to Get Started?

1. **Login** to your CodingBoss account
2. **Go to Tests** or **Assignments**
3. **Select a test** and click **Start**
4. **Answer questions** and **Submit**
5. **View your results** and celebrate! 🎉

---

## Questions?

If you have any questions or encounter issues:

1. **Check this guide** - Your question might be answered here
2. **Review IMPLEMENTATION_SUMMARY.md** - For technical details
3. **Contact your instructor** - For course-related questions
4. **Contact IT support** - For technical issues

Good luck with your tests! 📚

