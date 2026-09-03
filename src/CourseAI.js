import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FaRobot,
  FaTimes,
  FaPaperPlane,
  FaMicrophone,
  FaLightbulb,
  FaCode,
  FaMagic
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './CourseAI.css';

import javaData from './data/java.json';
import pythonData from './data/python.json';
import cData from './data/c.json';
import keywordData from './data/keyword.json';

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'can', 'do', 'does', 'for',
  'from', 'how', 'i', 'in', 'is', 'it', 'me', 'of', 'on', 'or', 'please',
  'sir', 'tell', 'that', 'the', 'this', 'to', 'use', 'what', 'when', 'where',
  'why', 'with', 'you', 'explain', 'doubt', 'question', 'answer'
]);

const QUICK_PROMPTS = [
  'Explain this lesson simply',
  'Give one coding example',
  'Create practice questions'
];

const ENGLISH_VOICE = { code: 'en-US', voicePrefix: 'en', label: 'English' };

const CONCEPT_LIBRARY = [
  {
    keys: ['variable', 'variables'],
    title: 'Variables',
    text: 'A variable is a named place where a program stores a value. Think of it as a labeled box: the label is the variable name, and the value inside can be used later in the program.',
    code: 'int age = 20;\nname = "Arun";'
  },
  {
    keys: ['loop', 'loops', 'for loop', 'while loop'],
    title: 'Loops',
    text: 'A loop repeats a block of code until a condition stops it. Use a for loop when you know the count, and a while loop when you repeat until something becomes false.',
    code: 'for (int i = 1; i <= 5; i++) {\n    System.out.println(i);\n}'
  },
  {
    keys: ['array', 'arrays', 'list', 'lists'],
    title: 'Arrays and lists',
    text: 'An array or list stores many values under one name. You access each value using its position, called an index. Most languages start indexing from 0.',
    code: 'numbers = [10, 20, 30]\nprint(numbers[0])'
  },
  {
    keys: ['function', 'functions', 'method', 'methods'],
    title: 'Functions',
    text: 'A function is a reusable block of code that performs one task. It can take input, process it, and return output. Functions reduce repetition and make code easier to test.',
    code: 'def add(a, b):\n    return a + b\n\nprint(add(5, 3))'
  },
  {
    keys: ['class', 'object', 'oop', 'oops', 'object oriented'],
    title: 'Object-oriented programming',
    text: 'OOP organizes code around classes and objects. A class is the blueprint, and an object is a real instance created from that blueprint. Encapsulation, inheritance, polymorphism, and abstraction are the main ideas.',
    code: 'class Student {\n    String name;\n\n    Student(String name) {\n        this.name = name;\n    }\n}'
  },
  {
    keys: ['pointer', 'pointers'],
    title: 'Pointers',
    text: 'A pointer is a variable that stores the memory address of another variable. In C, pointers are powerful because they let you work directly with memory, arrays, and dynamic allocation.',
    code: 'int x = 10;\nint *ptr = &x;\nprintf("%d", *ptr);'
  },
  {
    keys: ['recursion', 'recursive'],
    title: 'Recursion',
    text: 'Recursion means a function calls itself to solve a smaller version of the same problem. Every recursive solution needs a base case, otherwise it will continue forever.',
    code: 'int factorial(int n) {\n    if (n == 0) return 1;\n    return n * factorial(n - 1);\n}'
  },
  {
    keys: ['jvm', 'jdk', 'jre'],
    title: 'JDK, JRE, and JVM',
    text: 'JDK is used to develop Java programs, JRE is used to run Java programs, and JVM is the engine inside the JRE that executes Java bytecode.',
    code: 'Java source code -> javac https://untrumpeted-sallie-shallowly.ngrok-free.dev/compiler/ -> bytecode -> JVM -> output'
  },
  {
    keys: ['syntax error', 'compile error', 'runtime error', 'debug', 'bug'],
    title: 'Debugging errors',
    text: 'First read the exact error line, then check brackets, semicolons, spelling, data types, and variable scope. If the program runs but gives wrong output, trace values step by step.',
    code: '// Debug habit:\n// 1. Reproduce the error\n// 2. Read the line number\n// 3. Print/check variable values\n// 4. Fix one issue at a time'
  }
];

const getCourse = (data) => data?.course || {};

const getCourseTitle = (course) =>
  course.courseTitle || course.title || course.language || 'Programming';

const getCourseLanguage = (course) => {
  const title = getCourseTitle(course).toLowerCase();
  if (course.language) return course.language;
  if (title.includes('java')) return 'Java';
  if (title.includes('python')) return 'Python';
  if (title.includes(' c ') || title.startsWith('complete c')) return 'C';
  return 'Programming';
};

const getModules = (course) => course.chapters || course.modules || [];

const stringifyValue = (value, depth = 0) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => stringifyValue(item, depth + 1))
      .filter(Boolean)
      .join('\n');
  }
  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([key]) => key !== 'code')
      .map(([key, val]) => {
        const text = stringifyValue(val, depth + 1);
        if (!text) return '';
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
        return depth > 1 ? `${label}: ${text}` : `${label}: ${text}`;
      })
      .filter(Boolean)
      .join('\n');
  }
  return '';
};

const findCode = (value) => {
  if (!value) return '';
  if (typeof value === 'object' && !Array.isArray(value) && typeof value.code === 'string') {
    return value.code;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findCode(item);
      if (found) return found;
    }
  }
  if (typeof value === 'object') {
    for (const item of Object.values(value)) {
      const found = findCode(item);
      if (found) return found;
    }
  }
  return '';
};

const tokenize = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));

const unique = (items) => [...new Set(items)];

const getEnglishVoice = (voices) => {
  const voiceList = voices || [];
  return (
    voiceList.find((voice) => voice.lang === ENGLISH_VOICE.code) ||
    voiceList.find((voice) => voice.lang?.startsWith(ENGLISH_VOICE.voicePrefix)) ||
    null
  );
};

const buildKnowledgeIndex = () => {
  const allData = [javaData, pythonData, cData];
  const index = [];

  allData.forEach((data) => {
    const course = getCourse(data);
    const language = getCourseLanguage(course);

    getModules(course).forEach((module, moduleIndex) => {
      const chapterTitle = module.chapterTitle || module.moduleTitle || module.title || `Chapter ${moduleIndex + 1}`;
      const chapterOverview = module.chapterDescription || module.overview || module.description || '';

      (module.topics || module.projects || []).forEach((topic, topicIndex) => {
        const title = topic.topicTitle || topic.title || topic.name || `Topic ${topicIndex + 1}`;
        const contentParts = [
          topic.description,
          topic.content,
          topic.features,
          topic.dataTypes,
          topic.types,
          topic.operators,
          topic.rules,
          topic.steps,
          topic.example?.explanation
        ];
        const content = contentParts.map((part) => stringifyValue(part)).filter(Boolean).join('\n');
        const code = topic.example?.code || findCode(topic.content) || findCode(topic);
        const haystack = `${language} ${chapterTitle} ${chapterOverview} ${title} ${content} ${code}`;

        index.push({
          id: `${language}-${moduleIndex}-${topicIndex}`,
          language,
          courseTitle: getCourseTitle(course),
          chapterTitle,
          title,
          content,
          code,
          tokens: tokenize(haystack)
        });
      });
    });
  });

  return index;
};

const lessonToEntry = (activeLesson, courseData) => {
  if (!activeLesson) return null;
  const blocks = activeLesson.contentBlocks || [];
  const content = blocks
    .filter((block) => block.type !== 'code')
    .map((block) => block.value || block.title || block.term)
    .filter(Boolean)
    .join('\n');
  const code = blocks.find((block) => block.type === 'code')?.value || '';
  const language = courseData?.title?.includes('Python') ? 'Python' : courseData?.title?.includes('Java') ? 'Java' : courseData?.title?.includes('C') ? 'C' : 'Programming';

  return {
    id: 'active-lesson',
    language,
    courseTitle: courseData?.title || language,
    chapterTitle: activeLesson.title || 'Current lesson',
    title: activeLesson.title || 'Current lesson',
    content,
    code,
    tokens: tokenize(`${language} ${activeLesson.title} ${content} ${code}`)
  };
};

const isCurrentLessonRequest = (query) =>
  /this lesson|current lesson|this topic|current topic|lesson simply|today lesson/.test(query);

const scoreEntry = (entry, queryTokens, rawQuery, activeLessonTitle) => {
  const title = entry.title.toLowerCase();
  const chapter = entry.chapterTitle.toLowerCase();
  const content = entry.content.toLowerCase();
  let score = 0;

  queryTokens.forEach((token) => {
    if (title.includes(token)) score += 8;
    if (chapter.includes(token)) score += 5;
    if (entry.tokens.includes(token)) score += 2;
    if (content.includes(token)) score += 1;
  });

  if (rawQuery.includes(title) || title.includes(rawQuery)) score += 18;
  if (activeLessonTitle && title === activeLessonTitle.toLowerCase() && isCurrentLessonRequest(rawQuery)) {
    score += 10;
  }
  return score;
};

const findBestMatches = (query, knowledgeIndex, activeLessonEntry) => {
  const queryTokens = unique(tokenize(query));
  const searchPool = activeLessonEntry ? [activeLessonEntry, ...knowledgeIndex] : knowledgeIndex;
  const activeLessonTitle = activeLessonEntry?.title || '';

  return searchPool
    .map((entry) => ({
      ...entry,
      score: scoreEntry(entry, queryTokens, query.toLowerCase(), activeLessonTitle)
    }))
    .filter((entry) => entry.score > 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
};

const trimText = (text, maxLength = 850) => {
  const clean = String(text || '').replace(/\n{3,}/g, '\n\n').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).trim()}...`;
};

const wantsCode = (query) => /code|program|example|syntax|write|sample/.test(query);
const wantsSimple = (query) => /simple|easy|beginner|understand|eli5|short/.test(query);
const wantsPractice = (query) => /practice|quiz|exercise|task|test me|questions for|give questions/.test(query);
const wantsDifference = (query) => /difference|compare|vs|versus/.test(query);

const scoreKeywordEntry = (entry, lowerQuery, queryTokens) => {
  const title = String(entry.title || '').toLowerCase();
  const keywords = entry.keywords || entry.keys || [];
  const searchableQuery = lowerQuery.replace(/[^a-z0-9+#.\s]/g, ' ');
  let score = 0;

  if (title && lowerQuery.includes(title)) score += 12;

  keywords.forEach((keyword) => {
    const normalized = String(keyword).toLowerCase();
    if (!normalized) return;
    const exactSingleWord = normalized.length <= 2
      ? new RegExp(`(^|\\s)${normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`).test(searchableQuery)
      : searchableQuery.includes(normalized);
    if (exactSingleWord) {
      score += normalized.includes(' ') ? 12 : 8;
    }
    tokenize(normalized).forEach((token) => {
      if (queryTokens.includes(token)) score += 3;
    });
  });

  return score;
};

const conceptAnswer = (query) => {
  const lowerQuery = query.toLowerCase();
  const queryTokens = unique(tokenize(query));
  const library = [...keywordData, ...CONCEPT_LIBRARY];

  return library
    .map((concept) => ({
      ...concept,
      score: scoreKeywordEntry(concept, lowerQuery, queryTokens)
    }))
    .filter((concept) => concept.score >= 6)
    .sort((a, b) => b.score - a.score)[0];
};

const buildConceptAnswer = (concept) => {
  const answer = concept.answer || concept.text;
  return {
    text: `${concept.title}\n\n${answer}\n\nRemember it like this: first learn what it stores or does, then learn when to use it, then write a tiny program with it.\n\nIf this is still confusing, ask: "explain ${concept.title} with real life example".`,
    code: concept.code
  };
};

const buildPracticeAnswer = (match, query) => {
  const topic = match?.title || query;
  return {
    text: `Here are practice questions for ${topic}:\n\n1. Explain ${topic} in your own words.\n2. Write a small program that uses ${topic}.\n3. Find one real-world use case for ${topic}.\n4. What mistake can a beginner make in ${topic}?\n5. Change the example and predict the output before running it.`,
    code: match?.code || ''
  };
};

const buildMatchedAnswer = (query, matches, activeLessonEntry) => {
  const best = matches[0];
  const related = matches.slice(1).map((item) => item.title).filter((title) => title !== best.title);
  const simpleMode = wantsSimple(query);
  const codeMode = wantsCode(query);
  const differenceMode = wantsDifference(query);
  const fromCurrentLesson = best.id === activeLessonEntry?.id;

  let text = '';

  if (fromCurrentLesson) {
    text += `You are asking from the current lesson: ${best.title}.\n\n`;
  } else {
    text += `I found this in ${best.language}: ${best.title}.\n\n`;
  }

  if (differenceMode && related.length > 0) {
    text += `Comparison idea: ${best.title} is the main topic here. Also review ${related.join(', ')} because students often confuse these together.\n\n`;
  }

  text += simpleMode
    ? `Simple explanation:\n${trimText(best.content || 'This topic is part of your course. Read it as one small idea first, then connect it with an example.', 650)}`
    : `Proper explanation:\n${trimText(best.content || 'This topic is part of your course. Focus on the definition, the reason we use it, and one example.', 900)}`;

  if (codeMode && best.code) {
    text += '\n\nHow to read the code:\n1. Identify the variables or inputs.\n2. Follow the execution line by line.\n3. Check what output each statement produces.';
  } else if (best.code) {
    text += '\n\nI also found a code example below. Try changing one value and observe the output.';
  }

  if (related.length > 0) {
    text += `\n\nRelated topics to study next: ${related.join(', ')}.`;
  }

  text += '\n\nAsk me "give more example" or paste your code if you want me to explain it line by line.';

  return { text, code: best.code };
};

const buildGeneralAnswer = (query) => {
  const lowerQuery = query.toLowerCase();
  const concept = conceptAnswer(query);
  if (concept) {
    return buildConceptAnswer(concept);
  }

  if (/hello|hi|hey/.test(lowerQuery)) {
    return {
      text: 'Hello! Ask me any course doubt, coding question, error, example request, or practice question. I can explain Java, Python, C, and the current lesson step by step.',
      code: ''
    };
  }

  if (/roadmap|study|learn|start|where/.test(lowerQuery)) {
    return {
      text: 'A good study order is: basics, variables, operators, conditions, loops, functions, arrays or collections, OOP, files, errors, and projects. Study one topic, write one small program, then explain the output in your own words.',
      code: ''
    };
  }

  if (/error|not working|wrong output|fix/.test(lowerQuery)) {
    return {
      text: 'Paste your code and the exact error message. I will explain what the error means, where it happens, why it happens, and how to fix it. Until then, check spelling, brackets, semicolons, indentation, data types, and input values.',
      code: ''
    };
  }

  const topicWords = unique(tokenize(query)).slice(0, 6);
  if (topicWords.length > 0) {
    return {
      text: `You asked: "${query}"\n\nI do not want to answer a different lesson by mistake. Please add one course keyword or paste the code/error for this exact question.\n\nFor example:\n- "Explain ${topicWords.join(' ')} with example"\n- "Give code for ${topicWords.join(' ')}"\n- "Why ${topicWords.join(' ')} is used?"`,
      code: ''
    };
  }

  return {
    text: `I can answer this, but I need one more detail to be precise. Ask with the topic name or paste your code.\n\nTry these formats:\n- "Explain loops with example"\n- "Difference between array and list"\n- "Why my code gives error?"\n- "Give practice questions for functions"`,
    code: ''
  };
};

const getWelcomeMessage = () =>
  'Hello! I am your AI Course Mentor. Ask any doubt, any extra question, any code error, or ask for examples. I will explain step by step.';

const CourseAI = ({ activeLesson, courseData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('course_ai_muted') === 'true');
  const messagesEndRef = useRef(null);
  const voicesRef = useRef([]);
  const recognitionRef = useRef(null);
  const knowledgeIndex = useMemo(() => buildKnowledgeIndex(), []);
  const activeLessonEntry = useMemo(() => lessonToEntry(activeLesson, courseData), [activeLesson, courseData]);

  // Strictly only for students
  const userRole = localStorage.getItem("role");
  if (userRole !== 'member') return null;

  const voiceStatus = isMuted ? 'Voice muted' : isSpeaking ? 'Speaking in English' : 'English voice ready';

  useEffect(() => {
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis?.getVoices?.() || [];
    };

    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    setMessages((prev) => {
      if (prev.length > 1 || (prev.length === 1 && !prev[0].isWelcome)) return prev;
      return [
        {
          type: 'ai',
          text: getWelcomeMessage(),
          isWelcome: true
        }
      ];
    });
    return () => {
      window.speechSynthesis?.removeEventListener?.('voiceschanged', loadVoices);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, isOpen]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = ENGLISH_VOICE.code;
    recognition.onresult = (event) => {
      setInputValue(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.stop();
      } catch (err) {
        // Some browsers throw if recognition was never started.
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('course_ai_muted', String(isMuted));
    if (isMuted && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isMuted]);

  const speakResponse = (text) => {
    if (!window.speechSynthesis || !text || isMuted) return;
    window.speechSynthesis.cancel();
    const voices = window.speechSynthesis.getVoices?.() || [];

    const utterance = new SpeechSynthesisUtterance(text.replace(/\n/g, ' '));
    utterance.rate = 0.95;

    // Detect if text contains Tamil characters
    const isTamil = /[\u0B80-\u0BFF]/.test(text);

    if (isTamil) {
      const tamilVoice = voices.find(v =>
        v.lang === 'ta-IN' ||
        v.name.toLowerCase().includes('tamil') ||
        v.lang.toLowerCase().includes('ta')
      );
      if (tamilVoice) {
        utterance.voice = tamilVoice;
        utterance.lang = 'ta-IN';
      }
    } else {
      utterance.lang = 'en-US';
      utterance.voice = getEnglishVoice(voices.length ? voices : voicesRef.current);
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const processQuery = (question) => {
    const matches = findBestMatches(question, knowledgeIndex, activeLessonEntry);
    const query = question.toLowerCase();
    const directConcept = conceptAnswer(question);
    let result;

    if (wantsPractice(query)) {
      result = buildPracticeAnswer(matches[0] || activeLessonEntry, question);
    } else if (directConcept?.score >= 12 && (!matches[0] || directConcept.score >= matches[0].score)) {
      result = buildConceptAnswer(directConcept);
    } else if (matches.length > 0 && matches[0].score >= 5) {
      result = buildMatchedAnswer(question, matches, activeLessonEntry);
    } else {
      result = buildGeneralAnswer(question);
    }

    return result;
  };

  const handleSend = (e, quickText) => {
    if (e) e.preventDefault();
    const question = (quickText || inputValue).trim();
    if (!question) return;

    setMessages((prev) => [...prev, { type: 'user', text: question }]);
    setInputValue('');
    setIsThinking(true);

    setTimeout(() => {
      const result = processQuery(question);
      setMessages((prev) => [...prev, { type: 'ai', text: result.text, code: result.code }]);
      setIsThinking(false);
      speakResponse(result.text);
    }, 700);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    recognitionRef.current.start();
    setIsListening(true);
  };

  const aiWidget = (
    <div className="course-ai-wrapper">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="ai-chat-window"
          >
            <div className="ai-chat-header">
              <div className="ai-header-left">
                <div className="ai-avatar-container">
                  <FaRobot size={20} color="#fff" />
                  <div className="ai-pulse-dot"></div>
                </div>
                <div>
                  <h4 className="ai-title">AI Course Mentor</h4>
                  <p className="ai-status">{voiceStatus}</p>
                </div>
              </div>
              <div className="ai-header-actions">
                <button
                  type="button"
                  className={`ai-sound-btn ${isMuted ? 'muted' : ''}`}
                  onClick={() => setIsMuted((value) => !value)}
                  aria-label={isMuted ? 'Unmute AI voice' : 'Mute AI voice'}
                  title={isMuted ? 'Unmute voice' : 'Mute voice'}
                >
                  {isMuted ? 'MUTED' : 'MUTE'}
                </button>
                <button className="ai-close-btn" onClick={() => setIsOpen(false)} aria-label="Close AI mentor">
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="ai-chat-body">
              <div className="ai-suggestion-row">
                {QUICK_PROMPTS.map((prompt) => (
                  <button key={prompt} type="button" onClick={(e) => handleSend(e, prompt)}>
                    <FaLightbulb size={11} />
                    {prompt}
                  </button>
                ))}
              </div>

              {messages.map((msg, i) => (
                <div key={`${msg.type}-${i}`} className={`ai-msg-row ${msg.type}`}>
                  {msg.type === 'ai' && (
                    <div className="ai-msg-icon ai">
                      {msg.code ? <FaCode size={13} /> : <FaRobot size={14} />}
                    </div>
                  )}
                  <div className={`ai-bubble ${msg.type}`}>
                    {msg.text.split('\n').map((line, key) => (
                      <p key={key}>{line || '\u00a0'}</p>
                    ))}
                    {msg.code && (
                      <div className="ai-code-snippet">
                        <div className="code-header">
                          <FaCode size={12} /> EXAMPLE
                        </div>
                        <pre><code>{msg.code}</code></pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="ai-thinking">
                  <FaMagic size={12} />
                  Mentor is preparing a clear explanation...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="ai-chat-footer" onSubmit={handleSend}>
              <div className="ai-input-pill">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask any question, doubt, code error..."
                />
              </div>
              <button
                type="button"
                className={`ai-mic-btn ${isListening ? 'listening' : ''}`}
                onClick={toggleListening}
                disabled={!recognitionRef.current}
                aria-label="Speak your question in English"
                title="Speak in English"
              >
                <FaMicrophone />
              </button>
              <button type="submit" className="ai-send-btn" disabled={!inputValue.trim()}>
                <FaPaperPlane />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <button className="ai-fab-modern" onClick={() => setIsOpen(true)} aria-label="Open AI mentor">
          <div className="ai-fab-glow"></div>
          <FaRobot size={24} />
          <span className="ai-fab-badge">AI</span>
        </button>
      )}
    </div>
  );

  if (typeof document === 'undefined') return aiWidget;
  return createPortal(aiWidget, document.body);
};

export default CourseAI;
