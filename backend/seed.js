const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Student = require("./models/student.model");
const Instructor = require("./models/instructors.model");
const Secretary = require("./models/secretary.model");
const Course = require("./models/courses.model");
const Grade = require("./models/grade.model");
const Announcement = require("./models/announcement.model");

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully!");

    console.log("Clearing existing data...");
    await Promise.all([
      Student.deleteMany({}),
      Instructor.deleteMany({}),
      Secretary.deleteMany({}),
      Course.deleteMany({}),
      Grade.deleteMany({}),
      Announcement.deleteMany({}),
    ]);

    // Create Secretary
    console.log("Creating Secretary...");
    const secretaryPassword = await bcrypt.hash("admin123", 10);
    const secretary = await Secretary.create({
      name: "Admin",
      surname: "User",
      email: "admin@university.edu",
      password: secretaryPassword,
    });

    // Create Instructors
    console.log("Creating Instructors...");
    const instructorPassword = await bcrypt.hash("instructor123", 10);

    const instructor1 = await Instructor.create({
      name: "Dr. Sarah",
      surname: "Johnson",
      department: "Computer Engineering",
      email: "instructor@university.edu",
      password: instructorPassword,
    });

    const instructor2 = await Instructor.create({
      name: "Prof. Michael",
      surname: "Smith",
      department: "Software Engineering",
      email: "michael@university.edu",
      password: instructorPassword,
    });

    // Create Students
    console.log("Creating Students...");
    const studentPassword = await bcrypt.hash("student123", 12);

    const student1 = await Student.create({
      name: "John",
      surname: "Doe",
      department: "Computer Engineering",
      studentNumber: 20210001,
      email: "student@university.edu",
      password: studentPassword,
    });

    const student2 = await Student.create({
      name: "Alice",
      surname: "Williams",
      department: "Software Engineering",
      studentNumber: 20210002,
      email: "alice@university.edu",
      password: studentPassword,
    });

    // Create Courses
    console.log("Creating Courses...");
    const courses = await Course.insertMany([
      {
        courseName: "Data Structures",
        courseCode: "CS301",
        department: "Computer Engineering",
        instructor: instructor1._id,
      },
      {
        courseName: "Operating Systems",
        courseCode: "CS302",
        department: "Computer Engineering",
        instructor: instructor1._id,
      },
      {
        courseName: "Database Systems",
        courseCode: "CS202",
        department: "Computer Engineering",
        instructor: instructor1._id,
      },
      {
        courseName: "Software Architecture",
        courseCode: "SE401",
        department: "Software Engineering",
        instructor: instructor2._id,
      },
      {
        courseName: "Web Development",
        courseCode: "SE305",
        department: "Software Engineering",
        instructor: instructor2._id,
      }
    ]);

    // Assign courses to instructors
    instructor1.courses = [courses[0]._id, courses[1]._id, courses[2]._id];
    await instructor1.save();
    instructor2.courses = [courses[3]._id, courses[4]._id];
    await instructor2.save();

    // Create Grades for John Doe
    console.log("Creating Grades for John...");
    await Grade.insertMany([
      {
        student: student1._id,
        course: courses[0]._id,
        instructor: instructor1._id,
        midterm: 45,
        final: 42,
        letterGrade: "FF",
        makeupRequested: true,
      },
      {
        student: student1._id,
        course: courses[1]._id,
        instructor: instructor1._id,
        midterm: 88,
        final: 92,
        letterGrade: "AA",
      },
      {
        student: student1._id,
        course: courses[2]._id,
        instructor: instructor1._id,
        midterm: 65,
        final: 70,
        letterGrade: "BB",
      }
    ]);

    // Create Announcements
    console.log("Creating Announcements...");
    await Announcement.insertMany([
      {
        title: "Fall Semester Enrollment",
        content: "Course registration for the upcoming semester begins next Monday. Please consult your academic advisors.",
        department: "General",
        type: "normal",
        secretary: secretary._id
      },
      {
        title: "Final Exam Regulations",
        content: "Students must have their ID cards ready for all final examinations. No electronic devices are allowed.",
        department: "All Departments",
        type: "finals",
        secretary: secretary._id
      },
      {
        title: "Makeup Exam Information",
        content: "The schedule for makeup exams has been posted. Please check the department notice board for details.",
        department: "Computer Engineering",
        type: "makeup",
        instructor: instructor1._id
      },
      {
        title: "Career Seminar Invitation",
        content: "Join us this Friday for a seminar on 'Modern Trends in Software Engineering' featuring guest speakers from tech leaders.",
        department: "Software Engineering",
        type: "normal",
        instructor: instructor2._id
      }
    ]);

    console.log("Seeding completed successfully with rich data!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
