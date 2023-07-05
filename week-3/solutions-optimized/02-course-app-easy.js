const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const adminAuthentication = (req, res, next) => {
  const { username, password } = req.headers;

  const admin = ADMINS.find(a => a.username === username && a.password === password);
  if (admin) {
    next();
  } else {
    res.status(401).json({ message: 'Admin authentication failed' });
  }
};

const userAuthentication = (req, res, next) => {
  const { username, password } = req.headers;
  const user = USERS.find(u => u.username === username && u.password === password);
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401).json({ message: 'User authentication failed' });
  }
};

app.post('/admin/signup', (req, res) => {
  const { username } = req.body;
  const existingAdmin = ADMINS.find(a => a.username === username);
  if (existingAdmin) {
    res.status(409).json({ message: 'Admin already exists' });
  } else {
    ADMINS.push(req.body);
    res.status(201).json({ message: 'Admin created successfully' });
  }
});

app.post('/admin/login', adminAuthentication, (req, res) => {
  res.json({ message: 'Logged in successfully' });
});

app.post('/admin/courses', adminAuthentication,(req, res) => {
  const course = { ...req.body, id: Date.now() };
  COURSES.push(course);
  res.status(201).json({ message: 'Course created successfully', courseId: course.id });
});

app.put('/admin/courses/:courseId', adminAuthentication,  (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const courseIndex = COURSES.findIndex(c => c.id === courseId);
  if (courseIndex !== -1) {
    COURSES[courseIndex] = { ...COURSES[courseIndex], ...req.body };
    res.json({ message: 'Course updated successfully' });
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
});

app.get('/admin/courses', adminAuthentication, (req, res) => {
  res.json({ courses: COURSES });
});

app.post('/users/signup',  (req, res) => {
  const { username } = req.body;
  const existingUser = USERS.find(u => u.username === username);
  if (existingUser) {
    res.status(409).json({ message: 'User already exists' });
  } else {
    USERS.push({ ...req.body, purchasedCourses: [] });
    res.status(201).json({ message: 'User created successfully' });
  }
});

app.post('/users/login', userAuthentication, (req, res) => {
  res.json({ message: 'Logged in successfully' });
});

app.get('/users/courses', userAuthentication,  (req, res) => {
  const filteredCourses = COURSES.filter(c => c.published);
  res.json({ courses: filteredCourses });
});

app.post('/users/courses/:courseId', userAuthentication,(req, res) => {
  const courseId = Number(req.params.courseId);
  const course = COURSES.find(c => c.id === courseId && c.published);
  if (course) {
    req.user.purchasedCourses.push(courseId);
    res.json({ message: 'Course purchased successfully' });
  } else {
    res.status(404).json({ message: 'Course not found or not available' });
  }
});

app.get('/users/purchasedCourses', userAuthentication,  (req, res) => {
  const purchasedCourses = COURSES.filter(c => req.user.purchasedCourses.includes(c.id));
  res.json({ purchasedCourses });
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
