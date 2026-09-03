import React, { useState } from 'react';
import './TechnicalPrep.css';
import { 
  FaCode, 
  FaDatabase, 
  FaServer, 
  FaNetworkWired,
  FaCubes,
  FaDesktop,
  FaGlobe,
  FaCloud,
  FaChevronDown,
  FaLightbulb
} from 'react-icons/fa';

const TechnicalPrep = () => {
  const [activeCategory, setActiveCategory] = useState('DSA');
  const [openQuestionId, setOpenQuestionId] = useState(null);

  const toggleQuestion = (id) => {
    setOpenQuestionId(openQuestionId === id ? null : id);
  };

  const categories = [
    { id: 'DSA', title: 'Data Structures', icon: <FaCode />, count: '120 Qs' },
    { id: 'SYS', title: 'System Design', icon: <FaServer />, count: '45 Qs' },
    { id: 'DB', title: 'Databases & SQL', icon: <FaDatabase />, count: '60 Qs' },
    { id: 'NET', title: 'Networking', icon: <FaNetworkWired />, count: '30 Qs' },
    { id: 'OOP', title: 'OOPs Concepts', icon: <FaCubes />, count: '40 Qs' },
    { id: 'OS', title: 'Operating Systems', icon: <FaDesktop />, count: '35 Qs' },
    { id: 'WEB', title: 'Web Development', icon: <FaGlobe />, count: '80 Qs' },
    { id: 'CLOUD', title: 'Cloud & DevOps', icon: <FaCloud />, count: '25 Qs' }
  ];

  const flashcards = {
    'DSA': [
      {
        id: 1,
        title: 'Reverse a Linked List',
        difficulty: 'Easy',
        tags: ['Linked List', 'Pointers'],
        solution: 'Iterate through the list, maintaining a `prev`, `curr`, and `next` pointer. In each step, temporarily store `curr.next`, point `curr.next` to `prev`, and then shift `prev` and `curr` one step forward.',
        time: 'O(N)',
        space: 'O(1)'
      },
      {
        id: 2,
        title: 'Merge K Sorted Lists',
        difficulty: 'Hard',
        tags: ['Heap', 'Divide & Conquer'],
        solution: 'Use a Min-Heap (Priority Queue). Insert the head of each of the K lists into the heap. Extract the minimum, append it to your result, and push the next node from that extracted node\'s list back into the heap.',
        time: 'O(N log K)',
        space: 'O(K)'
      },
      {
        id: 3,
        title: 'Two Sum',
        difficulty: 'Easy',
        tags: ['Arrays', 'Hash Table'],
        solution: 'Iterate through the array while storing each number and its index in a hash map. For each number, check if the complement (target - current) exists in the hash map. If so, you found the pair.',
        time: 'O(N)',
        space: 'O(N)'
      }
    ],
    'SYS': [
      {
        id: 4,
        title: 'Design a URL Shortener (Bitly)',
        difficulty: 'Medium',
        tags: ['System Design', 'Hashing'],
        solution: 'Use Base62 encoding to convert a unique database auto-incrementing ID into a 7-character string. Use a relational database for ACID properties, and a Redis cluster acting as a write-through cache to handle massive read operations.',
        time: 'O(1) read',
        space: 'O(N)'
      }
    ],
    'DB': [
      {
        id: 5,
        title: 'Find Second Highest Salary',
        difficulty: 'Easy',
        tags: ['SQL', 'Subqueries'],
        solution: 'Use a subquery to find the MAX salary, then query for the MAX salary that is strictly less than the absolute MAX. Alternatively, use DENSE_RANK() window function.',
        time: '-',
        space: '-'
      }
    ],
    'NET': [
      {
        id: 6,
        title: 'What happens when you type google.com?',
        difficulty: 'Medium',
        tags: ['DNS', 'TCP/IP'],
        solution: 'DNS Resolution translates domain to IP. Browser initiates TCP 3-way handshake. TLS handshake establishes secure connection. Browser sends HTTP GET request. Server responds with HTML. Browser renders the DOM.',
        time: '-',
        space: '-'
      }
    ],
    'OOP': [
      {
        id: 7,
        title: 'What are the 4 pillars of OOP?',
        difficulty: 'Easy',
        tags: ['Theory', 'Fundamentals'],
        solution: 'Encapsulation (hiding data), Abstraction (hiding implementation details), Inheritance (reusing code from parent classes), and Polymorphism (methods doing different things based on the object).',
        time: '-',
        space: '-'
      }
    ],
    'OS': [
      {
        id: 8,
        title: 'What is a Deadlock?',
        difficulty: 'Medium',
        tags: ['Processes', 'Concurrency'],
        solution: 'A deadlock occurs when a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process. Required conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.',
        time: '-',
        space: '-'
      }
    ],
    'WEB': [
      {
        id: 9,
        title: 'Explain the Virtual DOM in React',
        difficulty: 'Medium',
        tags: ['React', 'Frontend'],
        solution: 'The Virtual DOM is a lightweight JavaScript representation of the actual DOM. When state changes, React creates a new VDOM, compares it with the previous VDOM (Diffing), and calculates the minimal operations needed to update the real DOM (Reconciliation).',
        time: '-',
        space: '-'
      }
    ],
    'CLOUD': [
      {
        id: 10,
        title: 'What is Docker?',
        difficulty: 'Medium',
        tags: ['DevOps', 'Containers'],
        solution: 'Docker is a platform for developing, shipping, and running applications in isolated environments called containers. Containers package the application code along with its dependencies (libraries, runtime) so it runs consistently on any machine.',
        time: '-',
        space: '-'
      }
    ]
  };

  const activeContent = flashcards[activeCategory] || [];

  return (
    <div className="tech-container">
      
      {/* MINIMAL HERO SECTION */}
      <div className="tech-hero">
        <div className="tech-badge">Technical Mastery</div>
        <h1 className="tech-title">Crack the Coding Interview</h1>
        <p className="tech-desc">
          Master the most critical technical concepts. Review optimal approaches, 
          time/space complexities, and core system design patterns.
        </p>
      </div>

      {/* HORIZONTAL TILE CARDS */}
      <div className="tech-grid">
        {categories.map(cat => (
          <div 
            key={cat.id} 
            className={`tech-category-card ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory(cat.id);
              setOpenQuestionId(null);
            }}
          >
            <div className="tech-cat-icon">{cat.icon}</div>
            <div className="tech-cat-info">
              <h3 className="tech-cat-title">{cat.title}</h3>
              <div className="tech-cat-count">{cat.count}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CLEAN LIST ACCORDION FOR QUESTIONS */}
      {activeContent.length > 0 && (
        <div className="tech-questions-section">
          <h2 className="tech-section-header">
            {categories.find(c => c.id === activeCategory).title} Questions
          </h2>
          
          <div className="tech-q-list">
            {activeContent.map((card, idx) => (
              <div 
                key={card.id} 
                className={`tech-q-item ${openQuestionId === card.id ? 'open' : ''}`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                
                <div className="tech-q-header" onClick={() => toggleQuestion(card.id)}>
                  <div className="tech-q-left">
                    <h3 className="tech-q-title">{card.title}</h3>
                    <div className="tech-q-tags">
                      {card.tags.map(tag => <span key={tag} className="tech-q-tag">{tag}</span>)}
                    </div>
                  </div>
                  <div className="tech-q-right">
                    <span className={`tech-q-difficulty ${card.difficulty.toLowerCase()}`}>
                      {card.difficulty}
                    </span>
                    <FaChevronDown className="tech-q-chevron" />
                  </div>
                </div>
                
                <div className="tech-q-body">
                  <div className="tech-q-content">
                    <div className="tech-solution-box">
                      <div className="tech-solution-label">
                        <FaLightbulb /> Optimal Approach
                      </div>
                      <p className="tech-solution-text">{card.solution}</p>
                      
                      <div className="tech-metrics">
                        <div className="tech-metric-box">
                          <span className="tech-metric-label">Time Complexity</span>
                          <span className="tech-metric-val">{card.time}</span>
                        </div>
                        <div className="tech-metric-box">
                          <span className="tech-metric-label">Space Complexity</span>
                          <span className="tech-metric-val">{card.space}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default TechnicalPrep;
