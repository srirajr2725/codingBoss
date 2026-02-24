import React, { useState, useEffect } from 'react';
import { useNavigate,Form } from 'react-router-dom';
import './CollegeAdminDashboard.css';
import  Navbar  from './NavbarComponent.js';
import CryptoJS from "crypto-js";
import Preloader from "./Preloader.js";
const Userdashboard = ({ isLoggedIn, setIsLoggedIn ,userRole, handleLogout, username }) => {
    const [selectedYear, setSelectedYear] = useState(2025);
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('CSE');
    const [sections, setSections] = useState([]); 
    const [selectedSection, setSelectedSection] = useState(null);
    const [sectionData, setSectionData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showSearchBox, setShowSearchBox] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const navigate = useNavigate();

    // Data structure for departments, sections, and specific information based on year
    const departmentData = {
        2025: {
            CSE: { 
                sections: ['A', 'B'], 
                data: { 
                    A: [
                        {
                            "id": 1,
                            "name": "Bavya",
                            "percentage": "70%",
                            "questions": "70",
                            "bending_assesments": "7",
                            "day1": "10", "day2": "10", "day3": "10", "day4": "10", "day5": "10", "day6": "10", "day7": "10", "day8": "10", "day9": "10", "day10": "10",
                            "total": "70"
                          },
                          {
                            "id": 2,
                            "name": "John",
                            "percentage": "80%",
                            "questions": "80",
                            "bending_assesments": "3",
                            "day1": "8", "day2": "8", "day3": "8", "day4": "8", "day5": "8", "day6": "8", "day7": "8", "day8": "8", "day9": "8", "day10": "8",
                            "total": "80"
                          }
                        
                    ],
                    B: [
                        {
                            "id": 3,
                            "name": "Alice",
                            "percentage": "85%",
                            "questions": "85",
                            "bending_assesments": "2",
                            "day1": "9", "day2": "9", "day3": "9", "day4": "9", "day5": "9", "day6": "9", "day7": "9", "day8": "9", "day9": "9", "day10": "9",
                            "total": "85"
                          },
                          {
                            "id": 4,
                            "name": "Bob",
                            "percentage": "90%",
                            "questions": "90",
                            "bending_assesments": "2",
                            "day1": "10", "day2": "10", "day3": "10", "day4": "10", "day5": "10", "day6": "10", "day7": "10", "day8": "10", "day9": "10", "day10": "10",
                            "total": "90"
                          }
                        


                    ]
                } 
            },
            ECE: { 
                sections: ['A', 'B'], 
                data: { 
                    A: [
                        {
                            "id": 5,
                            "name": "Eve",
                            "percentage": "65%",
                            "questions": "65",
                            "bending_assesments": "6",
                            "day1": "6", "day2": "6", "day3": "6", "day4": "6", "day5": "6", "day6": "6", "day7": "6", "day8": "6", "day9": "6", "day10": "6",
                            "total": "65"
                          },
                          {
                            "id": 6,
                            "name": "Mallory",
                            "percentage": "75%",
                            "questions": "75",
                            "bending_assesments": "5",
                            "day1": "7", "day2": "7", "day3": "7", "day4": "7", "day5": "7", "day6": "7", "day7": "7", "day8": "7", "day9": "7", "day10": "7",
                            "total": "75"
                          }
                    ],  
                    B: [
                        {
                            "id": 7,
                            "name": "Oscar",
                            "percentage": "88%",
                            "questions": "88",
                            "bending_assesments": "3",
                            "day1": "8", "day2": "8", "day3": "8", "day4": "8", "day5": "8", "day6": "8", "day7": "8", "day8": "8", "day9": "8", "day10": "8",
                            "total": "88"
                          },
                          {
                            "id": 8,
                            "name": "Charlie",
                            "percentage": "92%",
                            "questions": "92",
                            "bending_assesments": "6",
                            "day1": "9", "day2": "9", "day3": "9", "day4": "9", "day5": "9", "day6": "9", "day7": "9", "day8": "9", "day9": "9", "day10": "9",
                            "total": "92"
                          }
                    ]
                } 
            },
            MECH: { sections: ['A', 'B', 'C'], data: { 
                "A": [
                    {
                      "id": 9,
                      "name": "Sam",
                      "percentage": "82%",
                      "questions": "82",
                      "bending_assesments": "6",
                      "day1": "8", "day2": "8", "day3": "8", "day4": "8", "day5": "8", "day6": "8", "day7": "8", "day8": "8", "day9": "8", "day10": "8",
                      "total": "82"
                    }
                  ],
                  "B": [
                    {
                      "id": 10,
                      "name": "Alex",
                      "percentage": "67%",
                      "questions": "67",
                      "bending_assesments": "4",
                      "day1": "7", "day2": "7", "day3": "7", "day4": "7", "day5": "7", "day6": "7", "day7": "7", "day8": "7", "day9": "7", "day10": "7",
                      "total": "67"
                    }
                  ],
                  "C": [
                    {
                      "id": 11,
                      "name": "Taylor",
                      "percentage": "74%",
                      "questions": "74",
                      "bending_assesments": "7",
                      "day1": "7", "day2": "7", "day3": "7", "day4": "7", "day5": "7", "day6": "7", "day7": "7", "day8": "7", "day9": "7", "day10": "7",
                      "total": "74"
                    }
                  ]
            }},
            IT: { sections: ['A', 'B', 'C'], data: { 
                "A": [
                    {
                      "id": 12,
                      "name": "Sophie",
                      "percentage": "90%",
                      "questions": "90",
                      "bending_assesments": "2",
                      "day1": "10", "day2": "10", "day3": "10", "day4": "10", "day5": "10", "day6": "10", "day7": "10", "day8": "10", "day9": "10", "day10": "10",
                      "total": "90"
                    }
                  ],
                  "B": [
                    {
                      "id": 13,
                      "name": "James",
                      "percentage": "85%",
                      "questions": "85",
                      "bending_assesments": "4",
                      "day1": "9", "day2": "9", "day3": "9", "day4": "9", "day5": "9", "day6": "9", "day7": "9", "day8": "9", "day9": "9", "day10": "9",
                      "total": "85"
                    }
                  ],
                  "C": [
                    {
                      "id": 14,
                      "name": "Liam",
                      "percentage": "75%",
                      "questions": "75",
                      "bending_assesments": "3",
                      "day1": "8", "day2": "8", "day3": "8", "day4": "8", "day5": "8", "day6": "8", "day7": "8", "day8": "8", "day9": "8", "day10": "8",
                      "total": "75"
                    }
                  ]
            }},
        },
        2026: {
            CSE: { sections: ['A', 'B', 'C'], data: { 
            "A": [
          {
            "id": 15,
            "name": "Sam",
            "percentage": "82%",
            "questions": "82",
            "bending_assesments": "6",
            "day1": "8", "day2": "8", "day3": "8", "day4": "8", "day5": "8", "day6": "8", "day7": "8", "day8": "8", "day9": "8", "day10": "8",
            "total": "82"
          }
        ],
        "B": [
          {
            "id": 16,
            "name": "Alex",
            "percentage": "67%",
            "questions": "67",
            "bending_assesments": "4",
            "day1": "7", "day2": "7", "day3": "7", "day4": "7", "day5": "7", "day6": "7", "day7": "7", "day8": "7", "day9": "7", "day10": "7",
            "total": "67"
          }
        ],
        "C": [
          {
            "id": 17,
            "name": "Taylor",
            "percentage": "74%",
            "questions": "74",
            "bending_assesments": "7",
            "day1": "7", "day2": "7", "day3": "7", "day4": "7", "day5": "7", "day6": "7", "day7": "7", "day8": "7", "day9": "7", "day10": "7",
            "total": "74"
          }
        ] } },
            ECE: { sections: ['A', 'B'], data: { 
            "A": [
          {
            "id": 18,
            "name": "Bob",
            "percentage": "72%",
            "questions": "72",
            "bending_assesments": "4",
            "day1": "7", "day2": "7", "day3": "7", "day4": "7", "day5": "7", "day6": "7", "day7": "7", "day8": "7", "day9": "7", "day10": "7",
            "total": "72"
          }
        ],
        "B": [
          {
            "id": 19,
            "name": "Nancy",
            "percentage": "80%",
            "questions": "80",
            "bending_assesments": "2",
            "day1": "8", "day2": "8", "day3": "8", "day4": "8", "day5": "8", "day6": "8", "day7": "8", "day8": "8", "day9": "8", "day10": "8",
            "total": "80"
          }
        ] } },
            IT: { sections: ['A', 'B', 'C'], data: { 
                "A": [
                    {
                      "id": 20,
                      "name": "Sophie",
                      "percentage": "90%",
                      "questions": "90",
                      "bending_assesments": "2",
                      "day1": "10", "day2": "10", "day3": "10", "day4": "10", "day5": "10", "day6": "10", "day7": "10", "day8": "10", "day9": "10", "day10": "10",
                      "total": "90"
                    }
                  ],
                  "B": [
                    {
                      "id": 21,
                      "name": "James",
                      "percentage": "85%",
                      "questions": "85",
                      "bending_assesments": "4",
                      "day1": "9", "day2": "9", "day3": "9", "day4": "9", "day5": "9", "day6": "9", "day7": "9", "day8": "9", "day9": "9", "day10": "9",
                      "total": "85"
                    }
                  ],
                  "C": [
                    {
                      "id": 22,
                      "name": "Liam",
                      "percentage": "75%",
                      "questions": "75",
                      "bending_assesments": "3",
                      "day1": "8", "day2": "8", "day3": "8", "day4": "8", "day5": "8", "day6": "8", "day7": "8", "day8": "8", "day9": "8", "day10": "8",
                      "total": "75"
                    }
                  ]} },
        },
        2027: {
            ECE: { sections: ['A', 'B', 'C'], data: { 
                "A": [
          {
            "id": 23,
            "name": "Sam",
            "percentage": "82%",
            "questions": "82",
            "bending_assesments": "6",
            "day1": "8", "day2": "8", "day3": "8", "day4": "8", "day5": "8", "day6": "8", "day7": "8", "day8": "8", "day9": "8", "day10": "8",
            "total": "82"
          }
        ],
        "B": [
          {
            "id": 24,
            "name": "Alex",
            "percentage": "67%",
            "questions": "67",
            "bending_assesments": "4",
            "day1": "7", "day2": "7", "day3": "7", "day4": "7", "day5": "7", "day6": "7", "day7": "7", "day8": "7", "day9": "7", "day10": "7",
            "total": "67"
          }
        ],
        "C": [
          {
            "id": 25,
            "name": "Taylor",
            "percentage": "74%",
            "questions": "74",
            "bending_assesments": "7",
            "day1": "7", "day2": "7", "day3": "7", "day4": "7", "day5": "7", "day6": "7", "day7": "7", "day8": "7", "day9": "7", "day10": "7",
            "total": "74"
          }
        ] } },
            IT: { sections: ['A', 'B'], data: { 
               "A": [
          {
            "id": 26,
            "name": "Bob",
            "percentage": "72%",
            "questions": "72",
            "bending_assesments": "4",
            "day1": "7", "day2": "7", "day3": "7", "day4": "7", "day5": "7", "day6": "7", "day7": "7", "day8": "7", "day9": "7", "day10": "7",
            "total": "72"
          }
        ],
        "B": [
          {
            "id": 27,
            "name": "Nancy",
            "percentage": "80%",
            "questions": "80",
            "bending_assesments": "2",
            "day1": "8", "day2": "8", "day3": "8", "day4": "8", "day5": "8", "day6": "8", "day7": "8", "day8": "8", "day9": "8", "day10": "8",
            "total": "80"
          }
        ]} },
        },
        2028: {
            CSE: { sections: ['A', 'B', 'C'], data: { 
                "A": [
                    {
                      "id": 28,
                      "name": "Sophie",
                      "percentage": "90%",
                      "questions": "90",
                      "bending_assesments": "2",
                      "day1": "10", "day2": "10", "day3": "10", "day4": "10", "day5": "10", "day6": "10", "day7": "10", "day8": "10", "day9": "10", "day10": "10",
                      "total": "90"
                    }
                  ],
                  "B": [
                    {
                      "id": 29,
                      "name": "James",
                      "percentage": "85%",
                      "questions": "85",
                      "bending_assesments": "4",
                      "day1": "9", "day2": "9", "day3": "9", "day4": "9", "day5": "9", "day6": "9", "day7": "9", "day8": "9", "day9": "9", "day10": "9",
                      "total": "85"
                    }
                  ],
                  "C": [
                    {
                      "id": 30,
                      "name": "Liam",
                      "percentage": "75%",
                      "questions": "75",
                      "bending_assesments": "3",
                      "day1": "8", "day2": "8", "day3": "8", "day4": "8", "day5": "8", "day6": "8", "day7": "8", "day8": "8", "day9": "8", "day10": "8",
                      "total": "75"
                    }
                  ] } },
            ECE: { sections: ['A', 'B'], data: { 
                "A": [
          {
            "id": 31,
            "name": "Bob",
            "percentage": "72%",
            "questions": "72",
            "bending_assesments": "4",
            "day1": "7", "day2": "7", "day3": "7", "day4": "7", "day5": "7", "day6": "7", "day7": "7", "day8": "7", "day9": "7", "day10": "7",
            "total": "72"
          }
        ],
        "B": [
          {
            "id": 32,
            "name": "Nancy",
            "percentage": "80%",
            "questions": "80",
            "bending_assesments": "2",
            "day1": "8", "day2": "8", "day3": "8", "day4": "8", "day5": "8", "day6": "8", "day7": "8", "day8": "8", "day9": "8", "day10": "8",
            "total": "80"
          }
        ] } },
            MECH: { sections: ['A', 'B', 'C'], data: { 
                "A": [
                    {
                      "id": 33,
                      "name": "Sophie",
                      "percentage": "90%",
                      "questions": "90",
                      "bending_assesments": "2",
                      "day1": "10", "day2": "10", "day3": "10", "day4": "10", "day5": "10", "day6": "10", "day7": "10", "day8": "10", "day9": "10", "day10": "10",
                      "total": "90"
                    }
                  ],
                  "B": [
                    {
                      "id": 34,
                      "name": "James",
                      "percentage": "85%",
                      "questions": "85",
                      "bending_assesments": "4",
                      "day1": "9", "day2": "9", "day3": "9", "day4": "9", "day5": "9", "day6": "9", "day7": "9", "day8": "9", "day9": "9", "day10": "9",
                      "total": "85"
                    }
                  ],
                  "C": [
                    {
                      "id": 35,
                      "name": "Liam",
                      "percentage": "75%",
                      "questions": "75",
                      "bending_assesments": "3",
                      "day1": "8", "day2": "8", "day3": "8", "day4": "8", "day5": "8", "day6": "8", "day7": "8", "day8": "8", "day9": "8", "day10": "8",
                      "total": "75"
                    }
                  ] } },
        },
    };

  // useEffect(() => {
  //       if (!isLoggedIn) {
  //         if(localStorage.getItem("username") && localStorage.getItem("password")){
  //           const email = localStorage.getItem("username");
  //           const EncryptPassword = localStorage.getItem("password");
  //           const bytes = CryptoJS.AES.decrypt(EncryptPassword, 'thirancoding360mgai');
  //           const password = bytes.toString(CryptoJS.enc.Utf8);
  //           const Login = async () => {
  //             try {
  //               const response = await apiClient(
  //                 "quiz/users/login/",
  //                 "POST",
  //                 JSON.stringify({ email, password }),
  //                 { "Content-Type": "application/json" }
  //               );
  //               if (!response.status === "success") {
  //                 navigate('/LoginPage');
  //               }
  //               setIsLoggedIn(true);
  //               if(response.role !== "college"){
  //                 if(response.role === "company") {
  //                   navigate('/TrainerDashboard');}
  //                   else{
  //                     navigate('/');
  //                   }
  //               }
  //             } catch (error) {
  //               navigate('/LoginPage');
  //             }
  //           }
  //           Login();
  //         }
  //         else {
            
  //           navigate('/LoginPage');
  //         }
  //       } else if (userRole !== "college"){
  //         if(userRole === "company") {
  //           navigate('/TrainerDashboard');}
  //           else{
  //             navigate('/');
  //           }
               
  //       }
  //       setLoading(false); 
  //     }, [])


  useEffect(() => {
    const autoLogin = async () => {
      if (!isLoggedIn) {
        if (localStorage.getItem("username") && localStorage.getItem("password")) {
          const email = localStorage.getItem("username");
          const EncryptPassword = localStorage.getItem("password");
          const bytes = CryptoJS.AES.decrypt(EncryptPassword, 'thirancoding360mgai');
          const password = bytes.toString(CryptoJS.enc.Utf8);
          try {
            const response = await apiClient(
              "quiz/users/login/",
              "POST",
              JSON.stringify({ email, password }),
              { "Content-Type": "application/json" }
            );
            if (!response.status === "success") {
              navigate('/LoginPage');
              return; 
            } else {
              setIsLoggedIn(true);
              if (response.role !== "college") {
                if (response.role === "company") {
                  navigate('/TrainerDashboard');
                  return; 
                } else {
                  navigate('/');
                  return; 
                }
              }
            }
          } catch (error) {
            navigate('/LoginPage');
            return; 
          }
        } else {
          navigate('/LoginPage');
          return; 
        }
      } else if (userRole !== "college") {
        if (userRole === "company") {
          navigate('/TrainerDashboard');
          return; 
        } else {
          navigate('/');
          return; 
        }
      }
      setLoading(false);
    };
  
    autoLogin();
  }, []);
  

    useEffect(() => {
        setDepartments(Object.keys(departmentData[selectedYear]));
        if (departmentData[selectedYear][selectedDepartment]) {
            setSections(departmentData[selectedYear][selectedDepartment].sections);
            setSelectedSection(null);
            setSectionData([]);
        }
    }, [selectedYear, selectedDepartment]);

    const handleYearClick = (year) => {
        setSelectedYear(year);
        setSelectedDepartment('CSE');
    };

    const handleDepartmentClick = (department) => {
        setSelectedDepartment(department);
        setSections(departmentData[selectedYear][department].sections);
        setSelectedSection(null);
        setSectionData([]);
        setFilteredData([]); // Clear any previous filtered data
    };

    const handleSectionClick = (section) => {
        setSelectedSection(section);
        const data = departmentData[selectedYear][selectedDepartment].data[section];
        setSectionData(data);
        setFilteredData(data); // Initially show all data for the section
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
        setShowSearchBox(false); // Hide search box when dropdown is closed
    };

    const handleSearchClick = () => {
        setShowSearchBox(!showSearchBox);
    };

    const handleSearchSubmit = () => {
        const result = Object.values(departmentData).flatMap(department =>
            Object.values(department).flatMap(dept =>
                Object.values(dept.data).flatMap(section => 
                    section.filter(student => student.id === parseInt(searchQuery))
                )
            )
        ).find(student => student);

        if (result) {
            setFilteredData([result]);  // Filter the data to show only the matched student
            setSearchResult(result);
        } else {
            setSearchResult('Student ID not found');
            setFilteredData([]); // If no student found, clear the display
        }
    };
     // Handle redirection to Admission Enquiry page
     const handleAdmissionEnquiryClick = () => {
        navigate('/Enquire'); // Redirect to /enquiry page
    };

    // Handle redirection to upload question page
    const handleUploadquestionsClick = () => {
        navigate('/Uploadquestions'); // Redirect to /enquiry page
    };
    const handleCompanyClick = () => {
      navigate('/Company'); // Redirect to /enquiry page
  };
    

    const handleNavigateToDashboard = (studentData) => {
        navigate('/Dashboard', { state: { student: studentData } }); // Pass student data to dashboard
    };
    
    return (
      <>
      {loading ? (<Preloader/>
      ): (
      <>
    <Navbar 
            isLoggedIn={isLoggedIn} 
            setIsLoggedIn={setIsLoggedIn}
            username={username} 
            userRole={userRole} 
            handleLogout={handleLogout} 
          />
        <div className="dashboard-container">
            {/* Menu Button - Top Right Corner */}
            <div className="menu-button-container">
                <button className="menu-button" onClick={toggleDropdown}>
                    &#9776; {/* Three-line menu symbol */}
                </button>
                {showDropdown && (
                   <div className="dropdownn-menu">
                   <ul className="menu-items">
                       <li onClick={handleSearchClick}>Search Student By Id</li>
                       <li onClick={handleAdmissionEnquiryClick}>Admission Enquiry</li> {/* Redirect on click */}
                       <li onClick={handleUploadquestionsClick}>upload Questions</li>
                       <li onClick={handleCompanyClick}>Companys</li>
                   </ul>
                   
                    {/* Center the search box */}
    {showSearchBox && (
        <div className={`search-box-wrapper ${showSearchBox ? 'show' : ''}`}>
            <div className="search-box">
                <input
                    type="text"
                    placeholder="Enter Student ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={handleSearchSubmit}>Search</button>
            </div>
        </div>
    )}
</div>
               
                )}
            </div>

            <Sidebar handleYearClick={handleYearClick} />
            <div className="dashboard-content">
                <h1>User Dashboard</h1>
                <div className="row">
                <div className="card-row">
      {/* Department List Card */}
      <div className="card">
        <h2>Department</h2>
        <div className="button-container">
          {departments.map((dept, index) => (
            <button
              key={index}
              className={`department-button ${selectedDepartment === dept ? 'selected' : ''}`}
              onClick={() => handleDepartmentClick(dept)}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Sections for Selected Department Card */}
      <div className="card">
        <h2>Sections</h2>
        <div className="button-container">
          {sections.length > 0 ? (
            sections.map((section, index) => (
              <button
                key={index}
                className={`section-button ${selectedSection === section ? 'selected' : ''}`}
                onClick={() => handleSectionClick(section)}
              >
                {section}
              </button>
            ))
          ) : (
            <p>Please select a department</p>
          )}
        </div>
      </div>
    </div>

                   

{filteredData.length > 0 && (
    <div className="card-col">
        {filteredData.map((data) => (
            <div key={data.id} className="card student-card">
                <div className="card-content">
                    <h3>{data.name}</h3>
                    <div className="progress-bar">
                        <div 
                            className="progress" 
                            style={{ width: data.percentage }}
                            ></div>
                        </div>
                        <p> {data.percentage}</p>
                        {/* <p>Questions: {data.questions}</p>
                        <p>Bending Assessments: {data.bending_assesments}</p> */}
                </div>
                <button 
                    className="square-button" 
                    onClick={() => handleNavigateToDashboard(data)} // Pass data when clicked
                    
                >
                    &gt; {/* Right symbol (>) */}
                    
                </button>
            </div>
        ))}
    </div>
)}
                </div>
            </div>
        </div>
        </>
      )}
      </>
    );
};

// Sidebar component with static years
const Sidebar = ({ handleYearClick }) => {
    return (
        <div className="sidebar">
            <h2>Years</h2>
            <ul>
                {[2025, 2026, 2027, 2028].map((year) => (
                    <li key={year} onClick={() => handleYearClick(year)}>
                        {year}
                    </li>
                ))}
            </ul>
        </div>
        
    );
};

export default Userdashboard;

//this is admin dashboard
