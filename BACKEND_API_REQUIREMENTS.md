# Backend API Implementation Guide for Test Management System

## Overview
This document outlines the new API endpoints that need to be implemented in your Django backend to support:
1. Score calculation and storage for MCQ and Coding tests
2. Test completion tracking to prevent re-taking
3. Testcase management for coding questions

---

## 1. Check Test Completion Status

### Endpoint
```
GET /api/https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/check-test-completed/
```

### Query Parameters
- `user_id` (required): User's encrypted ID
- `subtype` (required): Test subtype (e.g., "Java", "Python")
- `type` (required): Test type ("Technical", "Aptitude", "SoftSkill")

### Response (Success - 200)
```json
{
  "is_completed": true,
  "completed": true,
  "completed_at": "2024-01-19T10:30:00Z",
  "score": 85,
  "total_questions": 10,
  "percentage": 85
}
```

### Response (Not Completed - 200)
```json
{
  "is_completed": false,
  "completed": false
}
```

---

## 2. Mark Test as Completed

### Endpoint
```
POST /api/https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/mark-test-completed/
```

### Request Body
```json
{
  "user_id": "encrypted_user_id",
  "subtype": "Java",
  "type": "Technical",
  "score": 8,
  "total_questions": 10,
  "percentage": 80
}
```

### Response (Success - 201)
```json
{
  "status": "success",
  "message": "Test marked as completed",
  "completed_at": "2024-01-19T10:30:00Z",
  "user_id": "user_id",
  "subtype": "Java"
}
```

---

## 3. Store MCQ Test Results

### Update Existing Evaluate Endpoint
**Current Endpoint:** `POST /api/https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/evaluate/`

### Enhanced Request Body
```json
{
  "user_id": "encrypted_user_id",
  "subtype": "Java",
  "type": "Technical",
  "answers": {
    "1": "Option A",
    "2": "Option B",
    "3": "Option C"
  }
}
```

### Enhanced Response (Success - 200)
```json
{
  "user_id": "user_id",
  "subtype": "Java",
  "type": "Technical",
  "total_questions": 10,
  "correct_answers": 8,
  "incorrect_answers": 2,
  "score": 8,
  "percentage": 80,
  "completed_at": "2024-01-19T10:30:00Z",
  "question_wise_results": [
    {
      "question_id": 1,
      "user_answer": "Option A",
      "correct_answer": "Option A",
      "is_correct": true
    }
  ]
}
```

---

## 4. Coding Question Testcase Management

### New Model: TestCase for Coding Questions

```python
class TestCase(models.Model):
    question = models.ForeignKey('CodingQuestion', on_delete=models.CASCADE, related_name='testcases')
    input_data = models.TextField()
    expected_output = models.TextField()
    score = models.IntegerField(default=1)  # Points for this testcase
    is_hidden = models.BooleanField(default=False)  # Whether to show in UI
    difficulty = models.CharField(max_length=20, choices=[('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Endpoint: Get Testcases for a Question
```
GET /api/https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/questions/{question_id}/testcases/
```

### Response (Success - 200)
```json
{
  "question_id": 123,
  "total_testcases": 5,
  "testcases": [
    {
      "id": 1,
      "input": "5",
      "expected_output": "120",
      "score": 1,
      "difficulty": "easy",
      "is_hidden": false
    },
    {
      "id": 2,
      "input": "10",
      "expected_output": "3628800",
      "score": 2,
      "difficulty": "hard",
      "is_hidden": false
    }
  ]
}
```

### Endpoint: Create/Update Testcases (Admin Only)
```
POST /api/https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/questions/{question_id}/testcases/
```

### Request Body
```json
{
  "testcases": [
    {
      "input_data": "5",
      "expected_output": "120",
      "score": 1,
      "difficulty": "easy",
      "is_hidden": false
    },
    {
      "input_data": "10",
      "expected_output": "3628800",
      "score": 2,
      "difficulty": "hard",
      "is_hidden": false
    }
  ]
}
```

---

## 5. Store Coding Test Submission with Testcase Results

### Endpoint
```
POST /api/https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/questions/submit/
```

### Request Body
```json
{
  "user_id": "encrypted_user_id",
  "question_id": 123,
  "language": "Python",
  "source_code": "def factorial(n):\n  return 1 if n == 0 else n * factorial(n-1)",
  "testcase_results": [
    {
      "testcase_id": 1,
      "passed": true,
      "input": "5",
      "expected": "120",
      "actual": "120",
      "execution_time": 0.05
    },
    {
      "testcase_id": 2,
      "passed": false,
      "input": "10",
      "expected": "3628800",
      "actual": "0",
      "execution_time": 0.03,
      "error": "RecursionError: maximum recursion depth exceeded"
    }
  ]
}
```

### Response (Success - 201)
```json
{
  "status": "success",
  "user_id": "user_id",
  "question_id": 123,
  "language": "Python",
  "passed_testcases": 4,
  "total_testcases": 5,
  "score": 4,
  "max_score": 5,
  "percentage": 80,
  "submitted_at": "2024-01-19T10:30:00Z",
  "testcase_results": [
    {
      "testcase_id": 1,
      "passed": true,
      "score": 1
    },
    {
      "testcase_id": 2,
      "passed": false,
      "score": 0
    }
  ]
}
```

---

## 6. Get User Test History

### Endpoint
```
GET /api/https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/user/{user_id}/test-history/
```

### Query Parameters
- `test_type` (optional): "MCQ" or "Coding"
- `limit` (optional): Number of records (default: 20)

### Response (Success - 200)
```json
{
  "user_id": "user_id",
  "total_tests": 15,
  "tests": [
    {
      "test_id": 1,
      "test_type": "MCQ",
      "subtype": "Java",
      "category": "Technical",
      "score": 8,
      "total_questions": 10,
      "percentage": 80,
      "completed_at": "2024-01-19T10:30:00Z",
      "time_taken": 45
    },
    {
      "test_id": 2,
      "test_type": "Coding",
      "question_id": 123,
      "language": "Python",
      "passed_testcases": 4,
      "total_testcases": 5,
      "percentage": 80,
      "completed_at": "2024-01-18T15:20:00Z"
    }
  ]
}
```

---

## Database Models (Django)

### MCQResult Model
```python
class MCQResult(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    subtype = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    total_questions = models.IntegerField()
    correct_answers = models.IntegerField()
    incorrect_answers = models.IntegerField()
    score = models.FloatField()
    percentage = models.FloatField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    time_taken = models.IntegerField(default=0)  # in minutes
    
    class Meta:
        unique_together = ('user', 'subtype', 'category', 'submitted_at')
```

### CodingResult Model
```python
class CodingResult(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    question = models.ForeignKey('CodingQuestion', on_delete=models.CASCADE)
    language = models.CharField(max_length=50)
    source_code = models.TextField()
    passed_testcases = models.IntegerField()
    total_testcases = models.IntegerField()
    score = models.FloatField()
    percentage = models.FloatField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    execution_time = models.FloatField(null=True)  # in seconds
    
    class Meta:
        unique_together = ('user', 'question', 'submitted_at')
```

### TestCaseResult Model
```python
class TestCaseResult(models.Model):
    coding_result = models.ForeignKey('CodingResult', on_delete=models.CASCADE, related_name='testcase_results')
    testcase = models.ForeignKey('TestCase', on_delete=models.CASCADE)
    passed = models.BooleanField()
    input_data = models.TextField()
    expected_output = models.TextField()
    actual_output = models.TextField()
    error_message = models.TextField(blank=True, null=True)
    execution_time = models.FloatField()
    score_earned = models.IntegerField()
```

---

## Implementation Priority

### Phase 1 (Critical)
1. Create MCQResult model and mark-test-completed endpoint
2. Update evaluate endpoint to return detailed score breakdown
3. Create check-test-completed endpoint

### Phase 2 (Important)
1. Create TestCase model for coding questions
2. Create CodingResult and TestCaseResult models
3. Implement testcase retrieval endpoints

### Phase 3 (Enhancement)
1. Create user test history endpoint
2. Add performance analytics
3. Implement leaderboard system

---

## Authentication Requirements

All endpoints (except login and signup) require:
- Bearer token in Authorization header
- User ID verification (encrypted in localStorage)

Example:
```
Authorization: Bearer <access_token>
```

---

## Error Handling

### Standard Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "error_code": "ERROR_TYPE",
  "timestamp": "2024-01-19T10:30:00Z"
}
```

### Common Error Codes
- `TEST_ALREADY_COMPLETED`: User has already completed this test
- `INVALID_USER`: User ID not found
- `QUESTION_NOT_FOUND`: Question ID not found
- `UNAUTHORIZED`: Missing or invalid token
- `VALIDATION_ERROR`: Invalid input data

---

## Testing Checklist

- [ ] Create test user accounts
- [ ] Test MCQ submission with score calculation
- [ ] Test coding submission with testcase results
- [ ] Verify test completion blocking
- [ ] Test concurrent submissions
- [ ] Verify score persistence in database
- [ ] Test leaderboard calculations
- [ ] Verify API rate limiting

---

## Notes

1. **Score Calculation**: 
   - MCQ: (Correct Answers / Total Questions) * 100
   - Coding: (Passed Testcases / Total Testcases) * 100

2. **Test Blocking**: Once marked as completed, users cannot retake the same test

3. **Testcase Scoring**: Each testcase can have different point values based on difficulty

4. **Data Persistence**: All results should be stored permanently for analytics and leaderboard

