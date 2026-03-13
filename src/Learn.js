import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';
import './Learn.css';

// Updated course data including Django
const courses = [
  {
    id: 1,
    title: 'Java Programming',
    description: 'Learn Java programming and build powerful applications.',
    imageUrl: 'https://w7.pngwing.com/pngs/578/816/png-transparent-java-class-file-java-platform-standard-edition-java-development-kit-java-runtime-environment-coffee-jar-text-class-orange-thumbnail.png',
    link: '/CourseJava',
    disabled: false
  },
  {
    id: 2,
    title: 'Python',
    description: 'Master Python and create data-driven applications and scripts.',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTA7KKo6TGOgs4XsvyKPfpGcfpaPv1Y44_kZQ&s',
    link: '/CoursePython',
    disabled: false
  },
  {
    id: 3,
    title: 'Django Web Framework',
    description: 'Build robust and scalable web backends with the "framework for perfectionists".',
    imageUrl: 'https://static.djangoproject.com/img/logos/django-logo-negative.png', // Using a standard Django logo
    link: '/CourseDjango',
    disabled: false
  },
];

const Courses = () => {
  const navigate = useNavigate();

  return (
    <>
      <h2 className='text-center mb-4'>
        Available Courses
      </h2>
      <Row className="justify-content-center">
        {courses.map(course => (
          <Col md={4} sm={6} key={course.id}>
            <Card 
              className='adjest' 
              style={{ 
                padding: '20px', 
                marginBottom: '16px', 
                marginLeft: '10px', 
                marginRight: '10px',
                minHeight: '450px' // Ensures uniform card height
              }}
            >
              <img 
                src={course.imageUrl} 
                style={{ objectFit: 'contain', backgroundColor: '#f8f9fa' }} 
                width="100%" 
                height="200" 
                alt={course.title} 
              />
              <h3 className="mt-3"><b>{course.title}</b></h3>
              <p>{course.description}</p>
              
              <div className="mt-auto">
                <Button 
                  variant="primary" 
                  disabled={course.disabled} 
                  size="lg" 
                  className="w-100"
                  onClick={() => navigate(course.link)}
                >
                  {course.disabled ? (
                    <>
                      Locked <FaLock style={{ fontSize: '0.8em', color: 'white', marginLeft: "10px" }} />
                    </>
                  ) : (
                    "View Details"
                  )}
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default Courses;