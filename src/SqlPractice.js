import React, { useState } from 'react';
import './SqlPractice.css';
import { 
  FaDatabase, 
  FaPlay, 
  FaCheckCircle, 
  FaTable, 
  FaCode, 
  FaTerminal,
  FaListUl,
  FaChevronDown
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from './utils/apiClient';

const sqlProblems = [
  {
    id: 1,
    title: 'High-Earner Employees',
    difficulty: 'Easy',
    category: 'Select',
    description: 'Write a SQL query to find the first_name, last_name, and salary of all employees who have a salary strictly greater than $100,000. Order the result by salary in descending order.',
    table: 'employees',
    schema: [
      { name: 'emp_id', type: 'INT (Primary Key)' },
      { name: 'first_name', type: 'VARCHAR(50)' },
      { name: 'last_name', type: 'VARCHAR(50)' },
      { name: 'department', type: 'VARCHAR(50)' },
      { name: 'salary', type: 'DECIMAL(10,2)' }
    ],
    defaultQuery: '-- Type your SQL query here\nSELECT * FROM employees;',
    results: [
      { first_name: 'Sarah', last_name: 'Connor', salary: '145000.00' },
      { first_name: 'Bruce', last_name: 'Wayne', salary: '130000.00' },
      { first_name: 'Tony', last_name: 'Stark', salary: '125000.00' },
      { first_name: 'Diana', last_name: 'Prince', salary: '115000.00' }
    ]
  },
  {
    id: 2,
    title: 'Department Highest Salary',
    difficulty: 'Medium',
    category: 'Joins',
    description: 'Write a SQL query to find employees who have the highest salary in each of the departments. Return department_name, employee_name, and salary.',
    table: 'departments, employees',
    schema: [
      { name: 'dept_id', type: 'INT (Primary Key)' },
      { name: 'dept_name', type: 'VARCHAR(50)' },
      { name: 'emp_id', type: 'INT (Primary Key)' },
      { name: 'emp_name', type: 'VARCHAR(50)' },
      { name: 'salary', type: 'INT' },
      { name: 'department_id', type: 'INT (Foreign Key)' }
    ],
    defaultQuery: '-- Type your SQL query here\nSELECT d.dept_name, e.emp_name, e.salary\nFROM employees e\nJOIN departments d ON e.department_id = d.dept_id;',
    results: [
      { dept_name: 'Engineering', emp_name: 'Sarah Connor', salary: '145000' },
      { dept_name: 'Sales', emp_name: 'Clark Kent', salary: '110000' },
      { dept_name: 'Marketing', emp_name: 'Bruce Wayne', salary: '130000' }
    ]
  },
  {
    id: 3,
    title: 'Duplicate Emails',
    difficulty: 'Easy',
    category: 'Group By',
    description: 'Write a SQL query to report all the duplicate emails. Note that it is guaranteed that the email field is not NULL.',
    table: 'users',
    schema: [
      { name: 'id', type: 'INT (Primary Key)' },
      { name: 'email', type: 'VARCHAR(255)' }
    ],
    defaultQuery: '-- Type your SQL query here\nSELECT email FROM users\nGROUP BY email\nHAVING COUNT(email) > 1;',
    results: [
      { email: 'a@b.com' },
      { email: 'test@example.com' }
    ]
  },
  {
    id: 4,
    title: 'Nth Highest Salary',
    difficulty: 'Hard',
    category: 'Subqueries',
    description: 'Write a SQL query to report the nth highest salary from the Employee table. If there is no nth highest salary, the query should report null.',
    table: 'employee',
    schema: [
      { name: 'id', type: 'INT (Primary Key)' },
      { name: 'salary', type: 'INT' }
    ],
    defaultQuery: '-- Type your SQL query here\n-- E.g. Find the 2nd highest salary\nSELECT MAX(salary) FROM employee\nWHERE salary < (SELECT MAX(salary) FROM employee);',
    results: [
      { 'SecondHighestSalary': '200000' }
    ]
  },
  {
    id: 5,
    title: 'Customers Who Never Order',
    difficulty: 'Easy',
    category: 'Filtering',
    description: 'Suppose that a website contains two tables, the Customers table and the Orders table. Write a SQL query to find all customers who never order anything.',
    table: 'customers, orders',
    schema: [
      { name: 'id (Customer)', type: 'INT (Primary Key)' },
      { name: 'name', type: 'VARCHAR(255)' },
      { name: 'id (Order)', type: 'INT (Primary Key)' },
      { name: 'customerId', type: 'INT (Foreign Key)' }
    ],
    defaultQuery: '-- Type your SQL query here\nSELECT name as Customers\nFROM Customers c\nLEFT JOIN Orders o ON c.id = o.customerId\nWHERE o.id IS NULL;',
    results: [
      { Customers: 'Henry' },
      { Customers: 'Max' }
    ]
  }
];

const SqlPractice = () => {
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);
  const problem = sqlProblems[selectedProblemIndex];
  
  const [query, setQuery] = useState(problem.defaultQuery);
  const [hasRun, setHasRun] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [resultsData, setResultsData] = useState([]);

  const handleSelectProblem = (index) => {
    setSelectedProblemIndex(index);
    setQuery(sqlProblems[index].defaultQuery);
    setHasRun(false);
    setResultsData([]);
    setShowDropdown(false);
  };

  const handleRunQuery = async () => {
    setIsRunning(true);
    try {
      const response = await apiClient('https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/challenges/sql/submit/', 'POST', {
        challenge_id: problem.id,
        query: query
      });

      // Backend returns { status: "success", result_table: [...] }
      if (response && response.result_table !== undefined) {
        setResultsData(response.result_table);
      } else {
        setResultsData(problem.results);
      }

      setIsRunning(false);
      setHasRun(true);
      toast.success('Query executed successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } catch (error) {
      setIsRunning(false);
      console.error("SQL execution error:", error);
      toast.error(error.message || "Execution failed. Check your query.", { theme: "colored" });
    }
  };

  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return '#10b981'; // emerald
    if (diff === 'Medium') return '#f59e0b'; // amber
    return '#f43f5e'; // rose
  };

  return (
    <div className="sql-container animate-fade-in">
      <ToastContainer />
      
      {/* LEFT PANE: Problem Statement & Schema */}
      <div className="sql-left-pane">
        
        {/* Problem Selector Header */}
        <div className="sql-problem-selector">
          <div 
            className="sql-selector-active" 
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaListUl className="sql-selector-icon" />
              <span className="sql-selector-text">Problem Library</span>
            </div>
            <FaChevronDown className="sql-chevron-icon" style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)' }} />
          </div>
          
          {showDropdown && (
            <div className="sql-dropdown-menu">
              {sqlProblems.map((prob, idx) => (
                <div 
                  key={prob.id} 
                  className={`sql-dropdown-item ${idx === selectedProblemIndex ? 'active' : ''}`}
                  onClick={() => handleSelectProblem(idx)}
                >
                  <span>{prob.id}. {prob.title}</span>
                  <span style={{ fontSize: '0.75rem', color: getDifficultyColor(prob.difficulty), fontWeight: 700 }}>
                    {prob.difficulty}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sql-header">
          <h1 className="sql-title">
            <div className="sql-title-icon-wrapper">
              <FaDatabase />
            </div>
            {problem.id}. {problem.title}
          </h1>
          <div className="sql-badges">
            <span className="sql-badge" style={{ color: getDifficultyColor(problem.difficulty), background: `${getDifficultyColor(problem.difficulty)}20`, border: `1px solid ${getDifficultyColor(problem.difficulty)}40` }}>
              {problem.difficulty}
            </span>
            <span className="sql-badge sql-category-badge">
              {problem.category}
            </span>
          </div>
        </div>

        <div className="sql-content">
          <p className="sql-description">
            {problem.description}
          </p>

          <h3 className="sql-schema-title">
            <FaTable className="sql-schema-icon" /> Database Schema
          </h3>
          
          <div className="sql-table-schema">
            <div className="sql-table-name">Tables: {problem.table}</div>
            {problem.schema.map((col, idx) => (
              <div key={idx} className="sql-column">
                <span className="sql-column-name">{col.name}</span>
                <span className="sql-column-type">{col.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Editor & Console */}
      <div className="sql-right-pane">
        
        {/* Editor Area */}
        <div className="sql-editor-container glass-panel">
          <div className="sql-editor-header">
            <div className="sql-editor-title">
              <FaCode className="sql-header-icon" /> Query Editor (MySQL)
            </div>
            <button className={`sql-run-btn ${isRunning ? 'running' : ''}`} onClick={handleRunQuery} disabled={isRunning}>
              {isRunning ? 'Running...' : <><FaPlay /> Run Query</>}
            </button>
          </div>
          <textarea 
            className="sql-textarea"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            spellCheck="false"
          />
        </div>

        {/* Results Area */}
        <div className="sql-results-container glass-panel">
          <div className="sql-results-header">
            <FaTerminal className="sql-header-icon" /> Execution Results
          </div>
          
          <div className="sql-results-content" style={{ padding: hasRun ? '0' : '20px' }}>
            {!hasRun ? (
              <span className="sql-placeholder-text">Waiting for execution... Click 'Run Query'.</span>
            ) : resultsData.length === 0 ? (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>Query executed successfully. 0 rows returned.</div>
            ) : (
              <div className="sql-table-wrapper">
                <table className="sql-success-table">
                  <thead>
                    <tr>
                      {Object.keys(resultsData[0]).map((key, idx) => (
                        <th key={idx}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resultsData.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((val, vIdx) => (
                          <td key={vIdx}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SqlPractice;
