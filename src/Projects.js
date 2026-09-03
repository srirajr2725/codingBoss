import React, { useState, useEffect } from 'react';
import './Projects.css';
import { 
  Code, Web, Storage, AutoAwesome, 
  PlayArrow, Search 
} from '@mui/icons-material';
import apiClient from './utils/apiClient';

const getIconForCategory = (category) => {
  const cat = category ? category.toLowerCase() : '';
  if (cat.includes('web')) return <Web />;
  if (cat.includes('ai') || cat.includes('ml')) return <AutoAwesome />;
  if (cat.includes('system') || cat.includes('cli')) return <Code />;
  return <Storage />;
};

const categories = ['All', 'Web Dev', 'AI / ML', 'Systems', 'Web3'];

const Projects = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await apiClient('compiler/projects/', 'GET');
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(proj => {
    const matchesCategory = activeCategory === 'All' || proj.category === activeCategory;
    const matchesSearch = proj.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (proj.tags && proj.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="projects-module-container">
      <div className="projects-header">
        <div className="projects-header-content">
          <h1>Project Library</h1>
          <p>Build real-world applications to master your skills and enhance your resume.</p>
        </div>
        <div className="projects-search-bar">
          <Search className="search-icon" />
          <input 
            type="text" 
            placeholder="Search projects or tags..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="projects-filter-tabs">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`filter-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="projects-grid">
        {loading ? (
          <div className="no-projects-found">
            <h3>Loading projects...</h3>
          </div>
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((proj, index) => (
            <div key={proj.id} className="project-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="project-card-header">
                <div className={`project-icon ${proj.category ? proj.category.replace(/[^a-zA-Z]/g, '').toLowerCase() : ''}`}>
                  {getIconForCategory(proj.category)}
                </div>
                <span className={`difficulty-badge ${proj.difficulty ? proj.difficulty.toLowerCase() : ''}`}>{proj.difficulty || 'Intermediate'}</span>
              </div>
              
              <h3 className="project-title">{proj.title}</h3>
              <p className="project-desc">{proj.desc}</p>
              
              <div className="project-tags">
                {proj.tags && proj.tags.map(tag => (
                  <span key={tag} className="tech-tag">{tag}</span>
                ))}
              </div>
              
              <div className="project-card-footer">
                <button className="start-btn">
                  <PlayArrow /> Start Project
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-projects-found">
            <h3>No projects found matching your criteria.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
