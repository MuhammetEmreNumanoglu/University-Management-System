import React, { useState, useEffect } from "react";
import {
  Space,
  Modal,
  Button,
  InputNumber,
  message,
  Table,
  Tabs,
  Descriptions,
  Select,
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import axios from "axios";

const { TabPane } = Tabs;

const Courses = ({
  courses,
  grades,
  gradesLoading,
  fetchStudentGrades,
  onUpdateGrade,
}) => {
  const [openCourses, setOpenCourses] = useState({});
  const [isGradeModalVisible, setIsGradeModalVisible] = useState(false);
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [midterm, setMidterm] = useState(0);
  const [finalOrMakeup, setFinalOrMakeup] = useState(0);
  const [letterGrade, setLetterGrade] = useState("");
  const [activeTab, setActiveTab] = useState("final");
  const [instructorDetails, setInstructorDetails] = useState(null);
  const [studentCount, setStudentCount] = useState(0);

  const fetchInstructorDetails = async (instructorId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/instructor/${instructorId}`
      );
      setInstructorDetails(response.data);
    } catch (error) {
      console.error("Error fetching instructor details:", error);
      message.error("Öğretim üyesi bilgileri yüklenirken hata oluştu");
    }
  };

  const fetchStudentCount = async (courseId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/course/${courseId}/students/count`
      );
      setStudentCount(response.data.count);
    } catch (error) {
      console.error("Error fetching student count:", error);
      setStudentCount(0);
    }
  };

  const toggleGrades = async (courseId) => {
    if (openCourses[courseId]) {
      setOpenCourses((prev) => ({ ...prev, [courseId]: false }));
      return;
    }

    try {
      await fetchStudentGrades(courseId);
      setOpenCourses((prev) => ({ ...prev, [courseId]: true }));
    } catch (error) {
      console.error("Notlar yüklenirken hata:", error);
      message.error("Notlar yüklenirken hata oluştu");
    }
  };

  const handleEditGrade = (grade) => {
    setSelectedGrade(grade);
    setMidterm(grade.midterm);
    setFinalOrMakeup(grade.final);
    setLetterGrade(grade.letterGrade || "");
    setIsGradeModalVisible(true);

    // Eğer öğrenci büt alamıyorsa, direkt final sekmesine geç
    if (!grade.makeup && !grade.makeupApproved) {
      setActiveTab("final");
    }
  };

  const handleUpdateGrade = async () => {
    try {
      // Eğer harf notu seçilmişse onu kullan, seçilmemişse hesapla
      const finalLetterGrade = letterGrade || calculateLetterGrade(midterm, finalOrMakeup);
      
      const payload = {
        letterGrade: finalLetterGrade,
        midterm: midterm,
        final: finalOrMakeup,
        isMakeup: activeTab === "makeup"
      };
      
      await onUpdateGrade(selectedGrade._id, payload);

      message.success("Not başarıyla güncellendi");
      setIsGradeModalVisible(false);
      await fetchStudentGrades(selectedGrade.course._id);
    } catch (error) {
      console.error("Not güncelleme hatası:", error);
      message.error(
        error.response?.data?.message || "Not güncellenirken hata oluştu"
      );
    }
  };

  // Harf notu hesaplama fonksiyonu
  const calculateLetterGrade = (midterm, final) => {
    const total = (midterm * 0.4) + (final * 0.6);
    
    if (total >= 90) return "AA";
    if (total >= 85) return "BA";
    if (total >= 80) return "BB";
    if (total >= 75) return "CB";
    if (total >= 70) return "CC";
    if (total >= 65) return "DC";
    if (total >= 60) return "DD";
    if (total >= 0) return "FF";
    return "DZ";
  };

  const handleShowInfo = (course) => {
    console.log("Course Data:", course);
    setSelectedCourse(course);
    setIsInfoModalVisible(true);
    if (course.instructor) {
      fetchInstructorDetails(course.instructor);
      fetchStudentCount(course._id);
    }
  };

  // Reset states when modal is closed
  const handleCloseModal = () => {
    setIsInfoModalVisible(false);
    setInstructorDetails(null);
    setStudentCount(0);
  };

  const columns = [
    {
      title: "Student",
      dataIndex: "student",
      key: "student",
      render: (_, record) => (
        <span>
          {record.student?.name} {record.student?.surname}
          <br />
          <small>{record.student?.studentNumber}</small>
        </span>
      ),
    },
    
    {
      title: "Letter Grade",
      dataIndex: "letterGrade",
      key: "letterGrade",
      align: "center",
      render: (grade) => grade || "-",
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => handleEditGrade(record)}>
       Edit
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div className="courses-container">
      <h2 style={{marginBottom:'20px'}}>The Lessons I Give</h2> 

      {courses.map((course) => (
        <div key={course._id} className="course-card">
          <div className="course-header">
            <div className="course-info">
              <h3>
                {course.courseName}
                <small> ({course.courseCode})</small>
              </h3>
              <p className="department">{course.department}</p>
            </div>
            <Space>
              <Button
                icon={<InfoCircleOutlined />}
                onClick={() => handleShowInfo(course)}
                type="text"
              />
              <Button style={{marginBottom:'30px'}}
                type={openCourses[course._id] ? "default" : "primary"}
                onClick={() => toggleGrades(course._id)}
                loading={gradesLoading[course._id]}
              >
                {gradesLoading[course._id]
                  ? "Loading..."
                  : openCourses[course._id]
                  ? "Hide Grades"
                  : "Show Grades"}
              </Button>
            </Space>
          </div>

          {openCourses[course._id] && grades[course._id] && (
            <div className="grades-table-container">
              <Table
                columns={columns}
                dataSource={grades[course._id]}
                rowKey={(record) => record._id}
                pagination={false}
                bordered
                size="small"
                locale={{
                  emptyText: "No grades found for this course",
                }}
              />
            </div>
          )}
        </div>
      ))}

      {/* Course Info Modal */}
      <Modal
        title="Course Details"
        visible={isInfoModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        {selectedCourse && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Course Name">
              {selectedCourse.courseName}
            </Descriptions.Item>
            <Descriptions.Item label="Department">
              {selectedCourse.department}
            </Descriptions.Item>
            <Descriptions.Item label="Registered Student Count">
              {studentCount} students
            </Descriptions.Item>
            {selectedCourse.description && (
              <Descriptions.Item label="Description">
                {selectedCourse.description}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Not Düzenleme Modalı */}
      <Modal
        title={`Edit Grades - ${selectedGrade?.student?.name || ""} ${
          selectedGrade?.student?.surname || ""
        }`}
        visible={isGradeModalVisible}
        onOk={handleUpdateGrade}
        onCancel={() => setIsGradeModalVisible(false)}
        okText="Update"
        cancelText="Cancel"
        width={600}
        destroyOnClose
      >
        {selectedGrade && (
          <div className="grade-edit-modal">
            <div className="info-section">
              <p>
                <strong>Lesson:</strong> {selectedGrade.course?.courseName}
              </p>
              <p>
                <strong>Student Number:</strong>{" "}
                {selectedGrade.student?.studentNumber}
              </p>
            </div>

            <div className="grade-inputs">
              <div className="input-group">
                <label>Midterm Grade:</label>
                <InputNumber
                  min={0}
                  max={100}
                  value={midterm}
                  onChange={setMidterm}
                  style={{ width: "100%" }}
                />
              </div>

              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="grade-tabs"
              >
                <TabPane tab="Final Grade" key="final">
                  <div className="input-group">
                    <label>Final Grade:</label>
                    <InputNumber
                      min={0}
                      max={100}
                      value={finalOrMakeup}
                      onChange={setFinalOrMakeup}
                      style={{ width: "100%" }}
                    />
                  </div>
                </TabPane>
                <TabPane
                  tab="Büt Notu"
                  key="makeup"
                  disabled={
                    !selectedGrade.makeup && !selectedGrade.makeupApproved
                  }
                >
                  <div className="input-group">
                    <label>Makeup Exam Grade:</label>
                    <InputNumber
                      min={0}
                      max={100}
                      value={finalOrMakeup}
                      onChange={setFinalOrMakeup}
                      style={{ width: "100%" }}
                    />
                    <p className="help-text">
                    Note: When the Makeup note is entered, this note will replace the final note.
                    </p>
                  </div>
                </TabPane>
              </Tabs>

              <div className="input-group" style={{ marginTop: "16px" }}>
                <label>Letter Grade:</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Select
                    value={letterGrade}
                    onChange={setLetterGrade}
                    style={{ width: "100%" }}
                    placeholder="Select a letter grade or let it be calculated automatically"
                  >
                    <Select.Option value="AA">AA</Select.Option>
                    <Select.Option value="BA">BA</Select.Option>
                    <Select.Option value="BB">BB</Select.Option>
                    <Select.Option value="CB">CB</Select.Option>
                    <Select.Option value="CC">CC</Select.Option>
                    <Select.Option value="DC">DC</Select.Option>
                    <Select.Option value="DD">DD</Select.Option>
                    <Select.Option value="FF">FF</Select.Option>
                    <Select.Option value="DZ">DZ (Absent)</Select.Option>
                  </Select>
                  {letterGrade && (
                    <Button 
                      onClick={() => setLetterGrade("")}
                      type="default"
                      danger
                    >
                      Reset
                    </Button>
                  )}
                </div>
                <p className="help-text" style={{ marginTop: "8px", color: "#666" }}>
                  Note: If you do not select a letter grade, it will be calculated automatically according to the visa and final grades.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Courses;
