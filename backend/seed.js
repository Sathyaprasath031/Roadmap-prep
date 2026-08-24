const mongoose = require('mongoose');
require('dotenv').config();

const Roadmap = require('./models/Roadmap');
const Question = require('./models/Question');
const { frontendQuestions, backendQuestions, dsaQuestions, systemDesignQuestions, devOpsQuestions, mlAiQuestions } = require('./data/questions');
const { additionalFrontend, additionalBackend, additionalDSA, additionalSystemDesign, additionalDevOps, additionalML } = require('./data/questions-extra');

const roadmaps = [
  {
    title: 'Frontend Development',
    slug: 'frontend',
    description: 'Master HTML, CSS, JavaScript, React, and modern frontend tools to ace frontend interviews.',
    icon: '🎨',
    color: '#6366f1',
    difficulty: 'Beginner',
    estimatedHours: 120,
    tags: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript'],
    steps: [
      {
        title: 'HTML & CSS Fundamentals',
        description: 'Master the building blocks of the web',
        order: 1,
        topics: ['Semantic HTML', 'CSS Flexbox', 'CSS Grid', 'Responsive Design', 'CSS Variables', 'Media Queries'],
        resources: [
          { title: 'MDN HTML Guide', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML', type: 'article', description: 'Comprehensive HTML reference', free: true },
          { title: 'CSS Flexbox Tutorial', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', type: 'article', description: 'Visual guide to flexbox', free: true },
          { title: 'CSS Grid Garden', url: 'https://cssgridgarden.com/', type: 'practice', description: 'Learn CSS grid with a game', free: true },
          { title: 'Flexbox Froggy', url: 'https://flexboxfroggy.com/', type: 'practice', description: 'Learn flexbox with a game', free: true },
          { title: 'Kevin Powell CSS Course', url: 'https://www.youtube.com/watch?v=rg7Fvvl3ogU', type: 'video', description: 'Complete CSS course', free: true },
        ],
      },
      {
        title: 'JavaScript Essentials',
        description: 'Deep dive into JavaScript fundamentals and ES6+',
        order: 2,
        topics: ['Variables & Scope', 'Closures', 'Promises & Async/Await', 'DOM Manipulation', 'Event Loop', 'Prototypes', 'Array Methods', 'ES6+ Features'],
        resources: [
          { title: 'javascript.info', url: 'https://javascript.info/', type: 'article', description: 'Modern JavaScript tutorial', free: true },
          { title: 'You Don\'t Know JS', url: 'https://github.com/getify/You-Dont-Know-JS', type: 'book', description: 'Deep dive JS book series', free: true },
          { title: 'Eloquent JavaScript', url: 'https://eloquentjavascript.net/', type: 'book', description: 'Free online JS book', free: true },
          { title: 'JavaScript30', url: 'https://javascript30.com/', type: 'course', description: '30 day vanilla JS challenge', free: true },
          { title: 'freeCodeCamp JS', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', type: 'course', description: 'JS algorithms course', free: true },
        ],
      },
      {
        title: 'React & State Management',
        description: 'Learn React ecosystem and modern state management',
        order: 3,
        topics: ['Components & JSX', 'Props & State', 'Hooks', 'Context API', 'Redux Toolkit', 'React Router', 'Performance Optimization', 'Error Boundaries'],
        resources: [
          { title: 'React Official Docs', url: 'https://react.dev/', type: 'article', description: 'Official React documentation', free: true },
          { title: 'React Tutorial', url: 'https://react.dev/learn', type: 'course', description: 'Learn React step by step', free: true },
          { title: 'Kent C. Dodds Blog', url: 'https://kentcdodds.com/blog', type: 'article', description: 'React best practices', free: true },
          { title: 'Redux Toolkit Docs', url: 'https://redux-toolkit.js.org/', type: 'article', description: 'Modern Redux guide', free: true },
          { title: 'Scrimba React Course', url: 'https://scrimba.com/learn/learnreact', type: 'video', description: 'Interactive React course', free: true },
        ],
      },
      {
        title: 'TypeScript',
        description: 'Add type safety to your JavaScript projects',
        order: 4,
        topics: ['Basic Types', 'Interfaces & Types', 'Generics', 'Utility Types', 'Type Guards', 'React + TypeScript'],
        resources: [
          { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/', type: 'article', description: 'Official TS handbook', free: true },
          { title: 'TypeScript Playground', url: 'https://www.typescriptlang.org/play', type: 'practice', description: 'Try TypeScript in browser', free: true },
          { title: 'Total TypeScript', url: 'https://www.totaltypescript.com/', type: 'course', description: 'Advanced TS course', free: false },
        ],
      },
      {
        title: 'Testing & Tooling',
        description: 'Master testing and build tools',
        order: 5,
        topics: ['Jest', 'React Testing Library', 'Cypress', 'Vite', 'Webpack', 'ESLint', 'Prettier', 'CI/CD Basics'],
        resources: [
          { title: 'Testing Library Docs', url: 'https://testing-library.com/', type: 'article', description: 'Testing library guides', free: true },
          { title: 'Cypress Documentation', url: 'https://docs.cypress.io/', type: 'article', description: 'E2E testing guide', free: true },
          { title: 'Vite Guide', url: 'https://vitejs.dev/guide/', type: 'article', description: 'Vite build tool guide', free: true },
        ],
      },
      {
        title: 'System Design Basics',
        description: 'Understand frontend architecture and performance',
        order: 6,
        topics: ['Performance Optimization', 'Web Vitals', 'Lazy Loading', 'Code Splitting', 'Service Workers', 'Progressive Web Apps'],
        resources: [
          { title: 'Web.dev', url: 'https://web.dev/learn', type: 'article', description: 'Google web development learning', free: true },
          { title: 'Patterns.dev', url: 'https://www.patterns.dev/', type: 'book', description: 'Web design patterns book', free: true },
        ],
      },
    ],
  },
  {
    title: 'Backend Development',
    slug: 'backend',
    description: 'Build scalable server-side applications with Node.js, Python, databases, and API design.',
    icon: '⚙️',
    color: '#10b981',
    difficulty: 'Intermediate',
    estimatedHours: 150,
    tags: ['Node.js', 'Python', 'Databases', 'APIs', 'System Design'],
    steps: [
      {
        title: 'Node.js Fundamentals',
        description: 'Master server-side JavaScript',
        order: 1,
        topics: ['Event Loop', 'Modules', 'Streams', 'File System', 'Child Processes', 'Error Handling'],
        resources: [
          { title: 'Node.js Docs', url: 'https://nodejs.org/en/docs/', type: 'article', description: 'Official Node.js documentation', free: true },
          { title: 'Node.js Design Patterns', url: 'https://www.nodejsdesignpatterns.com/', type: 'book', description: 'Advanced Node.js patterns', free: false },
          { title: 'The Complete Node.js Course', url: 'https://www.youtube.com/watch?v=TlB_eWDSMt4', type: 'video', description: 'Node.js full course', free: true },
        ],
      },
      {
        title: 'Express.js & REST APIs',
        description: 'Build RESTful APIs with Express',
        order: 2,
        topics: ['Routing', 'Middleware', 'Error Handling', 'Input Validation', 'Authentication', 'Rate Limiting'],
        resources: [
          { title: 'Express.js Guide', url: 'https://expressjs.com/en/guide/routing.html', type: 'article', description: 'Express routing guide', free: true },
          { title: 'RESTful API Design', url: 'https://restfulapi.net/', type: 'article', description: 'REST API best practices', free: true },
          { title: 'Build a REST API', url: 'https://www.youtube.com/watch?v=fgTGADljAsg', type: 'video', description: 'REST API tutorial', free: true },
        ],
      },
      {
        title: 'Database Design & SQL',
        description: 'Master relational databases and SQL',
        order: 3,
        topics: ['SQL Fundamentals', 'Joins', 'Indexing', 'Normalization', 'Transactions', 'PostgreSQL / MySQL'],
        resources: [
          { title: 'SQLBolt', url: 'https://sqlbolt.com/', type: 'practice', description: 'Interactive SQL exercises', free: true },
          { title: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com/', type: 'article', description: 'PostgreSQL learning guide', free: true },
          { title: 'Use The Index Luke', url: 'https://use-the-index-luke.com/', type: 'article', description: 'SQL performance guide', free: true },
        ],
      },
      {
        title: 'NoSQL & MongoDB',
        description: 'Work with document-based databases',
        order: 4,
        topics: ['Document Model', 'CRUD Operations', 'Aggregation Pipeline', 'Indexing', 'When to use NoSQL'],
        resources: [
          { title: 'MongoDB University', url: 'https://university.mongodb.com/', type: 'course', description: 'Free MongoDB courses', free: true },
          { title: 'MongoDB Manual', url: 'https://www.mongodb.com/docs/manual/', type: 'article', description: 'Official MongoDB docs', free: true },
        ],
      },
      {
        title: 'Authentication & Security',
        description: 'Implement secure authentication systems',
        order: 5,
        topics: ['JWT', 'OAuth 2.0', 'Session Management', 'bcrypt', 'CORS', 'Helmet.js', 'SQL Injection Prevention'],
        resources: [
          { title: 'Auth0 Blog', url: 'https://auth0.com/blog/', type: 'article', description: 'Authentication best practices', free: true },
          { title: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/', type: 'article', description: 'Web security risks', free: true },
        ],
      },
      {
        title: 'System Design & Architecture',
        description: 'Design scalable backend systems',
        order: 6,
        topics: ['Load Balancing', 'Caching (Redis)', 'Message Queues', 'Microservices', 'API Gateway', 'Database Sharding'],
        resources: [
          { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', type: 'article', description: 'Comprehensive SD guide', free: true },
          { title: 'Redis Documentation', url: 'https://redis.io/documentation', type: 'article', description: 'Redis learning resources', free: true },
          { title: 'Designing Data-Intensive Apps', url: 'https://dataintensive.net/', type: 'book', description: 'Must-read system design book', free: false },
        ],
      },
    ],
  },
  {
    title: 'Data Structures & Algorithms',
    slug: 'dsa',
    description: 'Crack coding interviews with strong DSA fundamentals and problem-solving skills.',
    icon: '🧮',
    color: '#f59e0b',
    difficulty: 'Intermediate',
    estimatedHours: 200,
    tags: ['Arrays', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting'],
    steps: [
      {
        title: 'Arrays & Strings',
        description: 'Master array manipulation and string algorithms',
        order: 1,
        topics: ['Two Pointers', 'Sliding Window', 'Prefix Sum', 'Kadane\'s Algorithm', 'String Matching'],
        resources: [
          { title: 'NeetCode Arrays', url: 'https://neetcode.io/roadmap', type: 'practice', description: 'Curated DSA problems', free: true },
          { title: 'LeetCode Top 150', url: 'https://leetcode.com/studyplan/top-interview-150/', type: 'practice', description: 'Must-do LeetCode problems', free: true },
          { title: 'Striver SDE Sheet', url: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/', type: 'practice', description: 'SDE interview sheet', free: true },
        ],
      },
      {
        title: 'Linked Lists & Stacks',
        description: 'Understand pointer manipulation and LIFO structures',
        order: 2,
        topics: ['Singly Linked Lists', 'Doubly Linked Lists', 'Fast & Slow Pointers', 'Stack Applications', 'Infix to Postfix'],
        resources: [
          { title: 'VisuAlgo', url: 'https://visualgo.net/en/list', type: 'tool', description: 'Visualize data structures', free: true },
          { title: 'HackerEarth DS', url: 'https://www.hackerearth.com/practice/data-structures/', type: 'article', description: 'DS tutorials', free: true },
        ],
      },
      {
        title: 'Trees & Binary Search Trees',
        description: 'Master tree traversals and BST operations',
        order: 3,
        topics: ['Binary Trees', 'BST', 'Traversals (In/Pre/Post/Level)', 'Balanced Trees', 'Trie'],
        resources: [
          { title: 'Visualizing Algorithms', url: 'https://visualgo.net/en/bst', type: 'tool', description: 'BST visualization', free: true },
          { title: 'MIT OCW Trees', url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/', type: 'course', description: 'MIT algorithms course', free: true },
        ],
      },
      {
        title: 'Graphs & BFS/DFS',
        description: 'Solve graph problems and traversal challenges',
        order: 4,
        topics: ['BFS', 'DFS', 'Dijkstra\'s', 'Topological Sort', 'Union Find', 'Minimum Spanning Tree'],
        resources: [
          { title: 'Graph Theory - CP-Algorithms', url: 'https://cp-algorithms.com/', type: 'article', description: 'Competitive programming algorithms', free: true },
          { title: 'William Fiset Graphs', url: 'https://www.youtube.com/playlist?list=PLDV1Zeh2NRsDGO4--qE8yH7uHwQKMoLqO', type: 'video', description: 'Graph theory video series', free: true },
        ],
      },
      {
        title: 'Dynamic Programming',
        description: 'Master the most important interview topic',
        order: 5,
        topics: ['Memoization', 'Tabulation', '1D DP', '2D DP', 'Knapsack Problems', 'Longest Common Subsequence'],
        resources: [
          { title: 'Striver DP Series', url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0qUlt5H_kiKYaNSqJ81PMMY', type: 'video', description: 'Complete DP playlist', free: true },
          { title: 'AtCoder DP Contest', url: 'https://atcoder.jp/contests/dp', type: 'practice', description: 'DP problemset', free: true },
          { title: 'LeetCode DP Patterns', url: 'https://seanprashad.com/leetcode-patterns/', type: 'practice', description: 'Pattern-based DP problems', free: true },
        ],
      },
      {
        title: 'Sorting & Searching',
        description: 'Implement and optimize sorting and searching algorithms',
        order: 6,
        topics: ['Quick Sort', 'Merge Sort', 'Binary Search', 'Heap Sort', 'Counting Sort', 'Top K Elements'],
        resources: [
          { title: 'Sorting Algorithms Vis', url: 'https://www.toptal.com/developers/sorting-algorithms', type: 'tool', description: 'Visual sorting comparison', free: true },
          { title: 'CP-Algorithms Sorting', url: 'https://cp-algorithms.com/algorithms/sorting.html', type: 'article', description: 'Algorithm descriptions', free: true },
        ],
      },
    ],
  },
  {
    title: 'Full Stack Development',
    slug: 'fullstack',
    description: 'Become a complete full stack developer with both frontend and backend expertise.',
    icon: '🚀',
    color: '#ec4899',
    difficulty: 'Advanced',
    estimatedHours: 300,
    tags: ['React', 'Node.js', 'Databases', 'DevOps', 'System Design'],
    steps: [
      {
        title: 'Frontend Mastery',
        description: 'Complete frontend development skills',
        order: 1,
        topics: ['HTML/CSS/JS', 'React/Next.js', 'TypeScript', 'State Management', 'Performance'],
        resources: [
          { title: 'Next.js Documentation', url: 'https://nextjs.org/docs', type: 'article', description: 'Full-stack React framework', free: true },
          { title: 'React Patterns', url: 'https://reactpatterns.com/', type: 'article', description: 'React design patterns', free: true },
        ],
      },
      {
        title: 'Backend Mastery',
        description: 'Build robust server-side applications',
        order: 2,
        topics: ['Node.js/Express', 'REST & GraphQL', 'Authentication', 'File Uploads', 'WebSockets'],
        resources: [
          { title: 'GraphQL Official', url: 'https://graphql.org/learn/', type: 'article', description: 'GraphQL learning resources', free: true },
          { title: 'Socket.io Docs', url: 'https://socket.io/docs/v4/', type: 'article', description: 'Real-time communication', free: true },
        ],
      },
      {
        title: 'Database Design',
        description: 'Design efficient database schemas',
        order: 3,
        topics: ['SQL & NoSQL', 'Data Modeling', 'Migrations', 'ORMs (Prisma/Sequelize)', 'Redis Caching'],
        resources: [
          { title: 'Prisma Docs', url: 'https://www.prisma.io/docs', type: 'article', description: 'Modern Node.js ORM', free: true },
          { title: 'Database Design Course', url: 'https://www.youtube.com/watch?v=ztHopE5Wnpc', type: 'video', description: 'Full database course', free: true },
        ],
      },
      {
        title: 'DevOps & Deployment',
        description: 'Deploy and manage applications',
        order: 4,
        topics: ['Docker', 'AWS/GCP', 'CI/CD', 'GitHub Actions', 'Nginx', 'Monitoring'],
        resources: [
          { title: 'Docker Getting Started', url: 'https://docs.docker.com/get-started/', type: 'article', description: 'Docker tutorial', free: true },
          { title: 'GitHub Actions Docs', url: 'https://docs.github.com/en/actions', type: 'article', description: 'CI/CD automation', free: true },
          { title: 'Railway Deploy', url: 'https://docs.railway.app/', type: 'tool', description: 'Easy app deployment', free: true },
        ],
      },
      {
        title: 'Testing',
        description: 'Write reliable, testable code',
        order: 5,
        topics: ['Unit Testing', 'Integration Testing', 'E2E Testing', 'TDD', 'Test Coverage'],
        resources: [
          { title: 'Jest Documentation', url: 'https://jestjs.io/docs/getting-started', type: 'article', description: 'JavaScript testing framework', free: true },
          { title: 'Playwright Docs', url: 'https://playwright.dev/', type: 'article', description: 'E2E testing framework', free: true },
        ],
      },
      {
        title: 'System Design for Full Stack',
        description: 'Design end-to-end systems',
        order: 6,
        topics: ['Architecture Patterns', 'API Design', 'Scalability', 'Caching', 'CDN', 'Load Testing'],
        resources: [
          { title: 'System Design Interview', url: 'https://github.com/donnemartin/system-design-primer', type: 'article', description: 'SD interview prep', free: true },
          { title: 'ByteByteGo', url: 'https://bytebytego.com/', type: 'course', description: 'System design course', free: false },
        ],
      },
    ],
  },
  {
    title: 'Machine Learning & AI',
    slug: 'ml-ai',
    description: 'Prepare for ML/AI interviews with fundamentals, math, and practical implementations.',
    icon: '🤖',
    color: '#8b5cf6',
    difficulty: 'Advanced',
    estimatedHours: 250,
    tags: ['Python', 'ML Algorithms', 'Deep Learning', 'NLP', 'Computer Vision'],
    steps: [
      {
        title: 'Python for ML',
        description: 'Master Python and its data science ecosystem',
        order: 1,
        topics: ['NumPy', 'Pandas', 'Matplotlib', 'Scikit-learn', 'Data Preprocessing'],
        resources: [
          { title: 'Python DS Handbook', url: 'https://jakevdp.github.io/PythonDataScienceHandbook/', type: 'book', description: 'Free Python DS book', free: true },
          { title: 'Kaggle Learn', url: 'https://www.kaggle.com/learn', type: 'course', description: 'Free ML courses', free: true },
        ],
      },
      {
        title: 'Mathematics for ML',
        description: 'Linear algebra, calculus, and probability',
        order: 2,
        topics: ['Linear Algebra', 'Calculus', 'Probability & Statistics', 'Optimization'],
        resources: [
          { title: '3Blue1Brown', url: 'https://www.youtube.com/c/3blue1brown', type: 'video', description: 'Visual math explanations', free: true },
          { title: 'Mathematics for ML Book', url: 'https://mml-book.github.io/', type: 'book', description: 'Free ML math book', free: true },
        ],
      },
      {
        title: 'Classical ML Algorithms',
        description: 'Understand core ML algorithms deeply',
        order: 3,
        topics: ['Linear Regression', 'Logistic Regression', 'Decision Trees', 'Random Forest', 'SVM', 'KNN', 'K-Means'],
        resources: [
          { title: 'StatQuest', url: 'https://www.youtube.com/c/joshstarmer', type: 'video', description: 'ML concepts explained simply', free: true },
          { title: 'Scikit-learn Docs', url: 'https://scikit-learn.org/stable/', type: 'article', description: 'ML library documentation', free: true },
        ],
      },
      {
        title: 'Deep Learning',
        description: 'Neural networks and deep learning frameworks',
        order: 4,
        topics: ['Neural Networks', 'CNNs', 'RNNs', 'Transformers', 'PyTorch/TensorFlow', 'Transfer Learning'],
        resources: [
          { title: 'fast.ai Course', url: 'https://course.fast.ai/', type: 'course', description: 'Practical deep learning', free: true },
          { title: 'Deep Learning Book', url: 'https://www.deeplearningbook.org/', type: 'book', description: 'Ian Goodfellow DL book', free: true },
          { title: 'Andrej Karpathy', url: 'https://www.youtube.com/c/AndrejKarpathy', type: 'video', description: 'DL video lectures', free: true },
        ],
      },
      {
        title: 'NLP & Computer Vision',
        description: 'Specialized ML domains',
        order: 5,
        topics: ['Text Processing', 'Word Embeddings', 'BERT/GPT', 'Object Detection', 'Image Classification'],
        resources: [
          { title: 'Hugging Face Course', url: 'https://huggingface.co/learn/nlp-course', type: 'course', description: 'NLP with transformers', free: true },
          { title: 'CS231n Stanford', url: 'https://cs231n.stanford.edu/', type: 'course', description: 'Stanford CV course', free: true },
        ],
      },
      {
        title: 'MLOps & Deployment',
        description: 'Deploy ML models to production',
        order: 6,
        topics: ['Model Serving', 'MLflow', 'Docker for ML', 'A/B Testing', 'Model Monitoring'],
        resources: [
          { title: 'MLOps Community', url: 'https://mlops.community/', type: 'tool', description: 'MLOps resources', free: true },
          { title: 'Made With ML', url: 'https://madewithml.com/', type: 'course', description: 'MLOps course', free: true },
        ],
      },
    ],
  },
  {
    title: 'DevOps & Cloud',
    slug: 'devops',
    description: 'Master CI/CD, containerization, cloud services, and infrastructure management.',
    icon: '☁️',
    color: '#0ea5e9',
    difficulty: 'Intermediate',
    estimatedHours: 180,
    tags: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform'],
    steps: [
      {
        title: 'Linux & Networking',
        description: 'Essential OS and networking knowledge',
        order: 1,
        topics: ['Linux Commands', 'Shell Scripting', 'TCP/IP', 'HTTP/HTTPS', 'DNS', 'Firewalls'],
        resources: [
          { title: 'Linux Journey', url: 'https://linuxjourney.com/', type: 'article', description: 'Learn Linux step by step', free: true },
          { title: 'Linux Upskill Challenge', url: 'https://linuxupskillchallenge.org/', type: 'course', description: '20-day Linux challenge', free: true },
        ],
      },
      {
        title: 'Docker & Containers',
        description: 'Containerize applications efficiently',
        order: 2,
        topics: ['Dockerfile', 'Docker Compose', 'Volumes', 'Networking', 'Multi-stage Builds'],
        resources: [
          { title: 'Docker Docs', url: 'https://docs.docker.com/get-started/', type: 'article', description: 'Official Docker tutorial', free: true },
          { title: 'Play with Docker', url: 'https://labs.play-with-docker.com/', type: 'practice', description: 'Hands-on Docker labs', free: true },
        ],
      },
      {
        title: 'Kubernetes',
        description: 'Orchestrate containers at scale',
        order: 3,
        topics: ['Pods', 'Deployments', 'Services', 'Ingress', 'ConfigMaps', 'Helm Charts'],
        resources: [
          { title: 'Kubernetes Tutorials', url: 'https://kubernetes.io/docs/tutorials/', type: 'article', description: 'Official K8s tutorials', free: true },
          { title: 'KillerCoda', url: 'https://killercoda.com/', type: 'practice', description: 'Interactive K8s scenarios', free: true },
        ],
      },
      {
        title: 'CI/CD Pipelines',
        description: 'Automate build, test, and deployment',
        order: 4,
        topics: ['GitHub Actions', 'GitLab CI', 'Jenkins', 'Pipeline Design', 'Secret Management'],
        resources: [
          { title: 'GitHub Actions', url: 'https://docs.github.com/en/actions', type: 'article', description: 'GitHub CI/CD guide', free: true },
          { title: 'CI/CD Best Practices', url: 'https://www.jetbrains.com/teamcity/ci-cd-guide/', type: 'article', description: 'CI/CD guide', free: true },
        ],
      },
      {
        title: 'Cloud Services (AWS)',
        description: 'Master major cloud platforms',
        order: 5,
        topics: ['EC2', 'S3', 'Lambda', 'RDS', 'VPC', 'IAM', 'CloudFormation'],
        resources: [
          { title: 'AWS Free Tier', url: 'https://aws.amazon.com/free/', type: 'tool', description: 'Hands-on AWS practice', free: true },
          { title: 'AWS Skill Builder', url: 'https://skillbuilder.aws/', type: 'course', description: 'Free AWS courses', free: true },
        ],
      },
      {
        title: 'Infrastructure as Code',
        description: 'Manage infrastructure with code',
        order: 6,
        topics: ['Terraform', 'Ansible', 'Pulumi', 'GitOps', 'Monitoring & Alerting'],
        resources: [
          { title: 'Terraform Learn', url: 'https://developer.hashicorp.com/terraform/tutorials', type: 'course', description: 'Official Terraform tutorials', free: true },
          { title: 'Prometheus Docs', url: 'https://prometheus.io/docs/', type: 'article', description: 'Monitoring system', free: true },
        ],
      },
    ],
  },
];

const questions = [
  ...frontendQuestions.map(q => ({ ...q, category: 'Frontend' })),
  ...additionalFrontend.map(q => ({ ...q, category: 'Frontend' })),
  ...backendQuestions.map(q => ({ ...q, category: 'Backend' })),
  ...additionalBackend.map(q => ({ ...q, category: 'Backend' })),
  ...dsaQuestions.map(q => ({ ...q, category: 'DSA' })),
  ...additionalDSA.map(q => ({ ...q, category: 'DSA' })),
  ...systemDesignQuestions.map(q => ({ ...q, category: 'System Design' })),
  ...additionalSystemDesign.map(q => ({ ...q, category: 'System Design' })),
  ...devOpsQuestions.map(q => ({ ...q, category: 'DevOps' })),
  ...additionalDevOps.map(q => ({ ...q, category: 'DevOps' })),
  ...mlAiQuestions.map(q => ({ ...q, category: 'ML/AI' })),
  ...additionalML.map(q => ({ ...q, category: 'ML/AI' })),
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Roadmap.deleteMany({});
    await Question.deleteMany({});

    const createdRoadmaps = await Roadmap.insertMany(roadmaps);
    console.log(`Seeded ${createdRoadmaps.length} roadmaps`);

    const dsaRoadmap = createdRoadmaps.find(r => r.slug === 'dsa');
    const frontendRoadmap = createdRoadmaps.find(r => r.slug === 'frontend');
    const backendRoadmap = createdRoadmaps.find(r => r.slug === 'backend');
    const systemDesignRoadmap = createdRoadmaps.find(r => r.slug === 'fullstack');
    const devopsRoadmap = createdRoadmaps.find(r => r.slug === 'devops');
    const mlRoadmap = createdRoadmaps.find(r => r.slug === 'ml-ai');

    const questionsWithRoadmaps = questions.map(q => {
      let roadmap;
      if (q.category === 'DSA') roadmap = dsaRoadmap?._id;
      else if (q.category === 'Frontend') roadmap = frontendRoadmap?._id;
      else if (q.category === 'Backend') roadmap = backendRoadmap?._id;
      else if (q.category === 'System Design') roadmap = systemDesignRoadmap?._id;
      else if (q.category === 'DevOps') roadmap = devopsRoadmap?._id;
      else if (q.category === 'ML/AI') roadmap = mlRoadmap?._id;
      return { ...q, roadmap };
    });

    const createdQuestions = await Question.insertMany(questionsWithRoadmaps);
    console.log(`Seeded ${createdQuestions.length} questions`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
