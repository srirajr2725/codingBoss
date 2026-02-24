import React, { useState } from 'react';
import  Navbar  from './Navbar';

const Enquire = ({ isLoggedIn ,setIsLoggedIn,userRole, handleLogout, username }) => {
    // Student data
    const students = [
        { name: 'Bavya', interestedDepartment: 'IT', ph: '7339339645', fathersName: 'Ganesh', mothersName: 'Kalaivani', address: 'DCFVGHBJNK', place: 'Erode', schoolName: 'GVHJ', tenthMark: 456, twelfthMark: 567, group: 'Bio', cutOff: 80 },
        { name: 'John', interestedDepartment: 'CSE', ph: '9876543210', fathersName: 'Ramesh', mothersName: 'Sita', address: 'Street 123', place: 'Coimbatore', schoolName: 'ABC School', tenthMark: 480, twelfthMark: 580, group: 'Maths', cutOff: 85 },
        { name: 'Alice', interestedDepartment: 'ECE', ph: '7896541230', fathersName: 'Vijay', mothersName: 'Lakshmi', address: 'XYZ Street', place: 'Salem', schoolName: 'DEF School', tenthMark: 490, twelfthMark: 600, group: 'Bio', cutOff: 90 }
    ];

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Handle clicking on the "Details" button
    const handleDetailsClick = (student) => {
        setSelectedStudent(student);
        setIsModalOpen(true); // Open the modal
    };

    // Handle closing the modal
    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (

        <>

    <Navbar 
            isLoggedIn={isLoggedIn} 
            setIsLoggedIn={setIsLoggedIn}
            username={username} 
            userRole={userRole} 
            handleLogout={handleLogout} 
          />
        <div>
           

            {/* Displaying the student cards one per row */}
            {students.map((student, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <div style={{
                        border: '1px solid #ccc', borderRadius: '5px', padding: '20px', width: '80%', textAlign: 'center',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div>
                            <h2>{student.name}</h2>
                            <p><strong>Interested Department:</strong> {student.interestedDepartment}</p>
                            <p><strong>Phone:</strong> {student.ph}</p>
                            <p><strong>Place:</strong> {student.place}</p>
                            <p><strong>School Name:</strong> {student.schoolName}</p>
                            <p><strong>Cutoff:</strong> {student.cutOff}%</p>
                        </div>
                        <button onClick={() => handleDetailsClick(student)} style={{
                            backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer',
                            borderRadius: '5px', marginTop: '10px'
                        }}>Details</button>
                    </div>
                </div>
            ))}

            {/* Modal for student details */}
            {isModalOpen && selectedStudent && (
                <div style={{
                    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: '1000'
                }}>
                    <div style={{
                        backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '400px', maxHeight: '80%', overflowY: 'auto',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3>Student Details</h3>
                        <p><strong>Name:</strong> {selectedStudent.name}</p>
                        <p><strong>Interested Department:</strong> {selectedStudent.interestedDepartment}</p>
                        <p><strong>Phone:</strong> {selectedStudent.ph}</p>
                        <p><strong>Father's Name:</strong> {selectedStudent.fathersName}</p>
                        <p><strong>Mother's Name:</strong> {selectedStudent.mothersName}</p>
                        <p><strong>Address:</strong> {selectedStudent.address}</p>
                        <p><strong>Place:</strong> {selectedStudent.place}</p>
                        <p><strong>School Name:</strong> {selectedStudent.schoolName}</p>
                        <p><strong>10th Mark:</strong> {selectedStudent.tenthMark}</p>
                        <p><strong>12th Mark:</strong> {selectedStudent.twelfthMark}</p>
                        <p><strong>Group:</strong> {selectedStudent.group}</p>
                        <p><strong>Cutoff:</strong> {selectedStudent.cutOff}%</p>
                        <button onClick={closeModal} style={{
                            backgroundColor: 'red', color: '#fff', border: 'none', padding: '10px', cursor: 'pointer', borderRadius: '5px'
                        }}>Close</button>
                    </div>
                </div>
            )}
        </div>
       </> 
    );
};

export default Enquire;
