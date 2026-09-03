const fs = require('fs');
let code = fs.readFileSync('src/CourseCard.js', 'utf8');

// Normalize newlines
code = code.replace(/\r\n/g, '\n');

// 1. Hero button
code = code.replace(
  /<button className="cc-feature-btn locked-btn" style=\{\{ background: '#64748b', cursor: 'not-allowed' \}\}>\n\s*<FaLock \/> Courses Locked\n\s*<\/button>/,
  `<button className="cc-feature-btn" onClick={() => setCurrentView('courses')}>
            Explore Courses <FaArrowRight style={{ marginLeft: '8px' }} />
          </button>`
);

// 2. Learning Pillar
code = code.replace(
  /className="cc-pillar-card learning-pillar locked"\n\s*whileHover=\{\{ y: 0 \}\}\n\s*style=\{\{ opacity: 0\.8, cursor: 'not-allowed' \}\}\n\s*>\n\s*<div className="cc-pillar-badge" style=\{\{ background: '#64748b' \}\}><FaLock \/> LOCKED<\/div>\n\s*<div className="cc-pillar-icon-wrapper" style=\{\{ background: 'rgba\\(100, 116, 139, 0\.1\\)' \}\}>\n\s*<FaBook className="cc-pillar-icon" style=\{\{ color: '#64748b' \}\} \/>/,
  `className="cc-pillar-card learning-pillar"
          whileHover={{ y: -10 }}
          onClick={() => setCurrentView('courses')}
        >
          <div className="cc-pillar-badge" style={{ background: '#6366f1' }}>PREMIUM</div>
          <div className="cc-pillar-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
            <FaBook className="cc-pillar-icon" style={{ color: '#6366f1' }} />`
);

code = code.replace(
  /<button className="cc-pillar-btn learning-btn" style=\{\{ background: '#64748b', borderColor: '#64748b' \}\}>\n\s*Academy Locked <FaLock style=\{\{ marginLeft: '8px' \}\} \/>\n\s*<\/button>/,
  `<button className="cc-pillar-btn learning-btn">
            Explore Academy <FaArrowRight style={{ marginLeft: '8px' }} />
          </button>`
);

// 3. Course feature cards
code = code.replace(
  /className="cc-feature-card locked"\n\s*style=\{\{ '--card-color': '#64748b', '--card-bg': 'rgba\\(100, 116, 139, 0\.05\\)', cursor: 'not-allowed' \}\}\n\s*whileHover=\{\{ y: 0 \}\}\n\s*>\n\s*<div className="cc-card-inner" style=\{\{ padding: '24px', opacity: 0\.7 \}\}>\n\s*<div className="cc-card-image" style=\{\{ width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', position: 'relative', filter: 'grayscale\\(1\\)' \}\}>\n\s*<img src=\{course\.image\} alt=\{course\.title\} style=\{\{ width: '100%', height: '100%', objectFit: 'cover' \}\} \/>\n\s*<div className="cc-card-stat-pill" style=\{\{ position: 'absolute', top: '12px', right: '12px', background: 'rgba\\(0,0,0,0\.6\\)', color: 'white', backdropFilter: 'blur\\(10px\\)', border: '1px solid rgba\\(255,255,255,0\.1\\)' \}\}>\n\s*<FaLock \/> Locked\n\s*<\/div>/g,
  `className="cc-feature-card"
            style={{ '--card-color': course.color, '--card-bg': \`\${course.color}1a\`, cursor: 'pointer' }}
            whileHover={{ y: -8 }}
            onClick={() => { setSelectedCourse(course); setCurrentView('pdf'); }}
          >
            <div className="cc-card-inner" style={{ padding: '24px' }}>
              <div className="cc-card-image" style={{ width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', position: 'relative' }}>
                <img src={course.image} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="cc-card-stat-pill" style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <FaPlay /> Preview
                </div>`
);

// 4. Course Preview Tabs button
code = code.replace(
  /<button className="cc-feature-btn locked-btn" style=\{\{ background: '#64748b', cursor: 'not-allowed' \}\}>\n\s*<FaLock \/> Course Preview Locked\n\s*<\/button>/,
  `<button className="cc-feature-btn" onClick={() => { setSelectedCourse(courses[activeTab]); setCurrentView('pdf'); }}>
                Preview Course <FaPlay style={{ marginLeft: '8px' }} />
              </button>`
);

// 5. Premium CTA Band button
code = code.replace(
  /<button className="cc-cta-primary locked-btn" style=\{\{ background: '#64748b', cursor: 'not-allowed' \}\}>\n\s*<FaLock \/> Academy Access Locked\n\s*<\/button>/,
  `<button className="cc-cta-primary" onClick={() => setCurrentView('courses')}>
              Join Academy <FaArrowRight style={{ marginLeft: '8px' }} />
            </button>`
);

fs.writeFileSync('src/CourseCard.js', code);
console.log('Done');
