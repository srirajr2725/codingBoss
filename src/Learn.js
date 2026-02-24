import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaLock } from 'react-icons/fa'
import './Learn.css';
// Sample course data
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
];

const Courses = () => {
  const navigate = useNavigate();

  return (
    <>
      <h2 className='text-center' mb={4}>
        Available Courses
      </h2>
      <Row>
        {courses.map(course => (
          <Col md={4} sm={6} key={course.id}>
            <Card className='adjest' style={{ padding: '20px', marginBottom: '16px', marginLeft: '20px', marginRight: '10px' }}>
              <img src={course.imageUrl} width="100%" height="200" alt={course.title} />
              <h3 variant="h6" mt={2}><b>{course.title}</b></h3>
              <p variant="body2">{course.description}</p>
             
              <Button variant="primary" disabled = {course.disabled} size="lg" onClick={() => navigate(course.link)}>
              View Details {course.disabled && <FaLock style={{ fontSize: '1em', color: 'black' , marginLeft:"10px", marginBottom:"5px"}} /> }
            </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default Courses;
