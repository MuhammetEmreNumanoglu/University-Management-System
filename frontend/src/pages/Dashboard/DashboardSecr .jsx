import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Input,
  Card,
  Button,
  Space,
  Typography,
  Modal,
  Form,
  message,
  Select,
  DatePicker,
  InputNumber,
  Collapse,
} from "antd";
import {
  PaperClipOutlined,
  DownloadOutlined,
  UploadOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileOutlined,
  UserOutlined,
  BankOutlined,
  MailOutlined,
  EyeOutlined,
  FilePptOutlined,
  FileZipOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../utils/axiosInstance";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const DashboardSecr = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [secretaryInfo, setSecretaryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [examFileList, setExamFileList] = useState([]);
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const [form3] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isStudentCreateModel, setIsStudentCreateModel] = useState(false);
  const [isInstructorCreateModel, setIsInstructorCreateModel] = useState(false);
  const [isDownloadModalVisible, setIsDownloadModalVisible] = useState(false);
  const [isExamTemplateModalVisible, setIsExamTemplateModalVisible] =
    useState(false);
  const [isExamUploadModalVisible, setIsExamUploadModalVisible] =
    useState(false);
  const [selectedCourseForDownload, setSelectedCourseForDownload] =
    useState(null);
  const [selectedCourseForExamTemplate, setSelectedCourseForExamTemplate] =
    useState(null);
  const [selectedCourseForExamUpload, setSelectedCourseForExamUpload] =
    useState(null);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [isExamCreateModal, setIsExamCreateModal] = useState(false);
  const [examForm] = Form.useForm();
  const [selectedType, setSelectedType] = useState(null);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);

  const departments = [
    "Computer Engineering",
    "Software Engineering",
    "Chemical Engineering",
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const response = await axiosInstance.get("/api/course");
        setCourses(response.data);
      } catch (error) {
        console.error("Error loading courses:", error);
        message.error("Error occurred while loading courses");
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchSecretaryInfo = async () => {
      try {
        const response = await axiosInstance.get("/api/get/secretary/info");
        setSecretaryInfo(response.data);
      } catch (e) {
        console.error("Error fetching secretary info:", e);
        setError("Error occurred while loading information");
      } finally {
        setLoading(false);
      }
    };

    fetchSecretaryInfo();
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await axiosInstance.get("/api/announcement");
        setAnnouncements(response.data);
        setFilteredAnnouncements(response.data);
      } catch (error) {
        console.error("Error loading announcements:", error);
        message.error("Error occurred while loading announcements");
      }
    };

    fetchAnnouncements();
  }, []);

  const generateWordDocument = (requests, courseName = "All Courses") => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${courseName} - Approved Applications`,
                  bold: true,
                  size: 28,
                }),
              ],
              spacing: { after: 400 },
            }),
            ...requests.flatMap((request, index) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Application #${index + 1}`,
                    bold: true,
                    size: 24,
                  }),
                ],
                spacing: { after: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Student: ", bold: true }),
                  new TextRun(
                    `${request.student?.name || "No info"} ${
                      request.student?.surname || ""
                    } (${request.student?.studentNumber || "No info"})`
                  ),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Course: ", bold: true }),
                  new TextRun(
                    `${request.course?.courseName || "No info"} (${
                      request.course?.courseCode || "!"
                    })`
                  ),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Grades: ", bold: true }),
                  new TextRun(
                    `Letter: ${request.grade?.letterGrade ?? "-"}`
                  ),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Description: ", bold: true }),
                  new TextRun(request.text || "No description"),
                ],
              }),
              new Paragraph({ text: "" }), // Empty line
            ]),
          ],
        },
      ],
    });

    return doc;
  };

  const downloadApprovedRequests = async () => {
    if (!selectedCourseForDownload) {
      message.error("Please select a course");
      return;
    }

    try {
      const response = await axiosInstance.get(
        `/api/secr/makeup-requests/approved?courseId=${selectedCourseForDownload}`
      );

      const selectedCourse = courses.find(
        (c) => c._id === selectedCourseForDownload
      );
      const doc = generateWordDocument(
        response.data,
        selectedCourse?.courseName
      );

      // Create and download Word document
      Packer.toBlob(doc).then((blob) => {
        saveAs(
          blob,
          `${selectedCourse?.courseName || "approved_applications"}.docx`
        );
        message.success("Word document downloaded");
        setIsDownloadModalVisible(false);
      });
    } catch (error) {
      console.error("Download error:", error);
      message.error("Error occurred while creating Word document");
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const showStudentCreateModal = () => {
    setIsStudentCreateModel(true);
  };

  const showInstructorCreateModal = () => {
    setIsInstructorCreateModel(true);
  };

  const showExamCreateModal = () => {
    setIsExamCreateModal(true);
  };

  const navigateToAnnouncements = () => {
    navigate("/announcement");
  };

  const handleStudentSubmit = async (values) => {
    try {
      const response = await axiosInstance.post("/api/student/create", values);
      message.success("Student created successfully");
      form2.resetFields();
      setIsStudentCreateModel(false);
    } catch (e) {
      console.log(e);
      message.error(
        e.response?.data?.message || "Error occurred while creating student"
      );
    }
  };

  const handleInstructorSubmit = async (values) => {
    try {
      const response = await axiosInstance.post(
        "/api/instructor/create",
        values
      );
      message.success("Instructor created successfully");
      form3.resetFields();
      setIsInstructorCreateModel(false);
    } catch (e) {
      console.log(e);
      message.error(
        e.response?.data?.message ||
          "Error occurred while creating instructor"
      );
    }
  };

  const handleExamSubmit = async (values) => {
    try {
      console.log("Submitting exam with values:", values);

      // Validate required fields
      if (
        !values.title ||
        !values.courseId ||
        !values.date ||
        !values.duration ||
        !values.location ||
        !values.type
      ) {
        message.error("Please fill in all required fields");
        return;
      }

      const examData = {
        title: values.title,
        courseId: values.courseId,
        date: values.date.toISOString(),
        duration: values.duration,
        location: values.location,
        description: values.description || "",
        type: values.type,
      };

      console.log("Sending exam data:", examData);

      const response = await axiosInstance.post("/api/exam/create", examData);
      console.log("Exam creation response:", response.data);

      message.success("Exam created successfully");
      examForm.resetFields();
      setIsExamCreateModal(false);
    } catch (e) {
      console.error("Error creating exam:", e);
      console.error("Error response:", e.response?.data);

      if (e.response?.status === 403) {
        message.error(
          "You don't have permission for this operation. Please log in again."
        );
      } else if (e.response?.status === 404) {
        message.error("Selected course not found.");
      } else if (e.response?.data?.message) {
        message.error(e.response.data.message);
      } else {
        message.error("Error occurred while creating exam");
      }
    }
  };

  const handleAnnouncementSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("content", values.content);
      formData.append("department", values.department);
      formData.append("type", values.type);

      if (fileList.length > 0) {
        fileList.forEach((file) => {
          formData.append("files", file.originFileObj);
        });
      }

      const response = await axiosInstance.post(
        "/api/announcement/add",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      message.success("Announcement created successfully");
      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
      fetchAnnouncements();
    } catch (error) {
      console.error("Error creating announcement:", error);
      message.error("Error occurred while creating announcement");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setFileList([]);
  };

  const onLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleTypeFilter = (type) => {
    if (type === selectedType) {
      setShowAnnouncements(!showAnnouncements);
      if (!showAnnouncements) {
        setSelectedType(null);
      }
    } else {
      setSelectedType(type);
      setShowAnnouncements(true);
    }
  };

  useEffect(() => {
    if (!announcements) return;

    let filtered = announcements;

    if (selectedType) {
      filtered = filtered.filter(
        (announcement) => announcement.type === selectedType
      );
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredAnnouncements(filtered);
  }, [announcements, selectedType]);

  const downloadExamTemplate = async () => {
    try {
      if (courses.length === 0) {
        message.error("Henüz hiç ders yok");
        return;
      }

      // Create a workbook
      const wb = XLSX.utils.book_new();

      // Create worksheet data with headers
      const wsData = [
        [
          "courseId",
          "courseName",
          "title",
          "date",
          "duration",
          "location",
          "description",
          "type",
        ],
      ];

      // Add all courses with all fields filled with example data
      courses.forEach((course) => {
        wsData.push([
          course._id,
          course.courseName,
          "Exam: " + course.courseName,
          "2025-12-31T10:00:00",
          60, // example duration in minutes
          "A-101 Sınav Salonu", // example location
          "Explanation", // example description
          "classical", // type set to classical
        ]);
      });

      // Create worksheet from data
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Set column widths
      ws['!cols'] = [
        { wch: 40 }, // courseId
        { wch: 35 }, // courseName
        { wch: 40 }, // title
        { wch: 30 }, // date
        { wch: 15 }, // duration
        { wch: 40 }, // location
        { wch: 70 }, // description
        { wch: 20 }  // type
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Sınav Şablonu");

      // Generate xlsx file
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

      // Convert to blob and download
      const blob = new Blob([wbout], { type: "application/octet-stream" });
      saveAs(blob, `tum_dersler_sinav_sablonu.xlsx`);

      message.success("Tüm dersler için sınav şablonu indirildi");
      setIsExamTemplateModalVisible(false);
    } catch (error) {
      console.error("Şablon indirme hatası:", error);
      message.error("Şablon oluşturulurken hata oluştu");
    }
  };

  const handleExamFileUpload = async () => {
    if (examFileList.length === 0) {
      message.error("Lütfen bir dosya yükleyin");
      return;
    }

    setUploadLoading(true);

    const file = examFileList[0].originFileObj;
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          message.error("Dosya boş veya uygun formatta değil");
          setUploadLoading(false);
          return;
        }

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        // Create a map of course IDs for validation
        const courseIdMap = new Map();
        courses.forEach((course) => {
          courseIdMap.set(course._id, course.courseName);
        });

        for (const row of jsonData) {
          try {
            // Validate required fields
            if (
              !row.courseId ||
              !row.title ||
              !row.date ||
              !row.duration ||
              !row.location ||
              !row.type
            ) {
              errorCount++;
              errors.push(
                `Satır ${jsonData.indexOf(row) + 2}: Zorunlu alanlar eksik`
              );
              continue;
            }

            // Validate course ID
            if (!courseIdMap.has(row.courseId)) {
              errorCount++;
              errors.push(
                `Satır ${jsonData.indexOf(row) + 2}: Geçersiz ders ID - ${
                  row.courseId
                }`
              );
              continue;
            }

            // Create exam data
            const examData = {
              title: row.title,
              courseId: row.courseId,
              date: new Date(row.date).toISOString(),
              duration: parseInt(row.duration),
              location: row.location,
              description: row.description || "",
              type: row.type,
            };

            // Send request to create exam
            await axiosInstance.post("/api/exam/create", examData);
            successCount++;
          } catch (error) {
            console.error("Sınav oluşturma hatası:", error);
            errorCount++;
            errors.push(
              `Satır ${jsonData.indexOf(row) + 2}: ${
                error.response?.data?.message || "İşlem hatası"
              }`
            );
          }
        }

        if (errorCount === 0) {
          message.success(`${successCount} sınav başarıyla oluşturuldu`);
        } else {
          message.warning(
            `${successCount} sınav oluşturuldu, ${errorCount} işlemde hata oluştu`
          );
          console.error("Hatalar:", errors);
        }

        setExamFileList([]);
        setIsExamUploadModalVisible(false);
      } catch (error) {
        console.error("Dosya işleme hatası:", error);
        message.error("Dosya işlenirken hata oluştu");
      } finally {
        setUploadLoading(false);
      }
    };

    reader.onerror = () => {
      message.error("Dosya okunamadı");
      setUploadLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  // Dosya ikonunu döndüren fonksiyon (instructor'dan alınmıştır)
  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return <FilePdfOutlined style={{ fontSize: "20px", color: "#ff4d4f" }} />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "bmp":
        return <FileImageOutlined style={{ fontSize: "20px", color: "#1890ff" }} />;
      case "doc":
      case "docx":
        return <FileWordOutlined style={{ fontSize: "20px", color: "#2a5699" }} />;
      case "xls":
      case "xlsx":
        return <FileExcelOutlined style={{ fontSize: "20px", color: "#217346" }} />;
      case "ppt":
      case "pptx":
        return <FilePptOutlined style={{ fontSize: "20px", color: "#d24726" }} />;
      case "zip":
      case "rar":
      case "7z":
        return <FileZipOutlined style={{ fontSize: "20px", color: "#faad14" }} />;
      case "txt":
        return <FileTextOutlined style={{ fontSize: "20px", color: "#8c8c8c" }} />;
      default:
        return <FileOutlined style={{ fontSize: "20px", color: "#8c8c8c" }} />;
    }
  };

  const isViewable = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    return ["pdf", "jpg", "jpeg", "png", "gif", "bmp", "txt"].includes(extension);
  };

  const getFileUrl = (file) => {
    if (file.url && file.url.startsWith("http")) {
      return file.url;
    }
    if (file.path) {
      const pathParts = file.path.split("/");
      const filename = pathParts[pathParts.length - 1];
      return `/api/files/${filename}?originalname=${encodeURIComponent(file.originalname || file.name)}`;
    }
    if (file.filename) {
      return `/api/files/${file.filename}?originalname=${encodeURIComponent(file.originalname || file.name)}`;
    }
    return file.url || "";
  };

  const getViewUrl = (file) => {
    const extension = (file.originalname || file.name || "").split(".").pop().toLowerCase();
    const isImage = ["jpg", "jpeg", "png", "gif", "bmp"].includes(extension);
    let filename;
    if (file.path) {
      const pathParts = file.path.split("/");
      filename = pathParts[pathParts.length - 1];
    } else {
      filename = file.filename;
    }
    if (isImage && filename) {
      return `/uploads/${filename}`;
    }
    return getFileUrl(file);
  };

  const handleFileDownload = async (file) => {
    try {
      if (file.filename) {
        const response = await axiosInstance.get(`/api/files/${file.filename}`, { responseType: "blob" });
        saveAs(new Blob([response.data]), file.originalname || file.name);
        return;
      }
      if (file.path) {
        const pathParts = file.path.split("/");
        const filename = pathParts[pathParts.length - 1];
        const response = await axiosInstance.get(`/api/files/${filename}`, { responseType: "blob" });
        saveAs(new Blob([response.data]), file.originalname || file.name);
        return;
      }
      if (file.url) {
        window.open(file.url, "_blank");
      }
    } catch (err) {
      console.error("Dosya indirme hatası:", err);
      message.error("Dosya indirilirken hata oluştu");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red", textAlign: "center" }}>
        {error}
      </div>
    );
  }

  if (!secretaryInfo) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Secretary information not found
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Title level={2} style={{ marginBottom: "24px", textAlign: "center" }}>
        Secretary Panel
      </Title>

      <Card
        title="Profile Information"
        style={{ marginBottom: "24px", width: "100%" }}
        extra={
          <Space>
            <Button 
              className="Btn" 
              danger 
              onClick={onLogout}
              style={{
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ff4d4f';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.color = '';
              }}
            >
              Logout
            </Button>
            <Button
              type="default"
              onClick={navigateToAnnouncements}
              icon={<PaperClipOutlined />}
              style={{
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              View Announcements
            </Button>
          </Space>
        }
      >
        <div style={{ 
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <UserOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
            <div>
              <Text type="secondary" style={{ fontSize: "14px" }}>Name</Text>
              <div style={{ fontSize: "16px", fontWeight: "500" }}>
                {secretaryInfo.name} {secretaryInfo.surname}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "500" }}>
                {secretaryInfo.department}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <MailOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
            <div>
              <Text type="secondary" style={{ fontSize: "14px" }}>Email</Text>
              <div style={{ fontSize: "16px", fontWeight: "500" }}>
                {secretaryInfo.email}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Space 
        style={{ 
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          gap: '16px',
          flexWrap: 'wrap'
        }}
      >
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={showModal}
          style={{
            background: "linear-gradient(90deg, #1890ff 0%, #40a9ff 100%)",
            color: "#fff",
            border: "none",
            boxShadow: "0 2px 8px rgba(24,144,255,0.15)",
            fontWeight: 600,
            borderRadius: 8,
            transition: "all 0.3s",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.07)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          New Announcement
        </Button>
        <Button
          type="primary"
          onClick={showExamCreateModal}
          style={{
            background: "linear-gradient(90deg, #1890ff 0%, #40a9ff 100%)",
            color: "#fff",
            border: "none",
            boxShadow: "0 2px 8px rgba(24,144,255,0.15)",
            fontWeight: 600,
            borderRadius: 8,
            transition: "all 0.3s",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.07)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          Add Exam
        </Button>
        <Button
          type="primary"
          icon={<FileExcelOutlined />}
          onClick={() => setIsExamTemplateModalVisible(true)}
          style={{
            background: "linear-gradient(90deg, #1890ff 0%, #40a9ff 100%)",
            color: "#fff",
            border: "none",
            boxShadow: "0 2px 8px rgba(24,144,255,0.15)",
            fontWeight: 600,
            borderRadius: 8,
            transition: "all 0.3s",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.07)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          Download Exam Template
        </Button>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={() => setIsExamUploadModalVisible(true)}
          style={{
            background: "linear-gradient(90deg, #1890ff 0%, #40a9ff 100%)",
            color: "#fff",
            border: "none",
            boxShadow: "0 2px 8px rgba(24,144,255,0.15)",
            fontWeight: 600,
            borderRadius: 8,
            transition: "all 0.3s",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.07)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          Add Exam via File
        </Button>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => setIsDownloadModalVisible(true)}
          style={{
            background: "linear-gradient(90deg, #1890ff 0%, #40a9ff 100%)",
            color: "#fff",
            border: "none",
            boxShadow: "0 2px 8px rgba(24,144,255,0.15)",
            fontWeight: 600,
            borderRadius: 8,
            transition: "all 0.3s",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.07)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          Download Approved Applications
        </Button>
      </Space>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "60px",
          marginBottom: "24px",
        }}
      >
        <Button
          type={
            selectedType === null && showAnnouncements ? "primary" : "default"
          }
          onClick={() => handleTypeFilter(null)}
        >
          All Announcements
        </Button>
        <Button
          type={
            selectedType === "normal" && showAnnouncements
              ? "primary"
              : "default"
          }
          onClick={() => handleTypeFilter("normal")}
        >
          Normal Notifications
        </Button>
        <Button
          type={
            selectedType === "finals" && showAnnouncements
              ? "primary"
              : "default"
          }
          onClick={() => handleTypeFilter("finals")}
        >
          Final Notifications
        </Button>
        <Button
          type={
            selectedType === "makeup" && showAnnouncements
              ? "primary"
              : "default"
          }
          onClick={() => handleTypeFilter("makeup")}
        >
          Makeup Notifications
        </Button>
      </div>

      {showAnnouncements && filteredAnnouncements.length > 0 && (
        <Card title="Announcements" style={{ marginBottom: "24px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px"
          }}>
            {filteredAnnouncements.map((announcement) => (
              <Collapse
                key={announcement._id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <Collapse.Panel
                  header={
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      padding: "8px 0"
                    }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>
                          {announcement.title}
                        </span>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <span style={{ fontSize: "14px", padding: "4px 8px", borderRadius: "30px 50px 30px 50px", backgroundColor: announcement.department && announcement.department !== "General" ? "#1890ff" : "#87d068", color: "white" }}>
                            {announcement.department && announcement.department !== "General" ? announcement.department : "All Departments"}
                          </span>
                          <span style={{ fontSize: "14px", padding: "4px 8px", borderRadius: "30px 50px 30px 50px", backgroundColor: announcement.type === "finals" ? "#ff4d4f" : announcement.type === "makeup" ? "#faad14" : "#52c41a", color: "white" }}>
                            {announcement.type === "finals" ? "Final Notification" : announcement.type === "makeup" ? "Makeup Notification" : "Normal Notification"}
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: "12px", color: "#666", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  }
                  key="1"
                >
                  <div style={{ padding: "16px 0" }}>
                    <p style={{ marginBottom: "16px", fontSize: "14px", lineHeight: "1.6", color: "#333" }}>
                      {announcement.content}
                    </p>
                    <div style={{ marginTop: "16px", color: "#666", fontSize: "12px", borderTop: "1px solid #f0f0f0", paddingTop: "12px" }}>
                      <p>
                        <strong>Department:</strong> {announcement.department && announcement.department !== "General" ? announcement.department : "All Departments"}
                      </p>
                      <p>
                        <strong>Type:</strong> {announcement.type === "finals" ? "Final Notification" : announcement.type === "makeup" ? "Makeup Notification" : "Normal Notification"}
                      </p>
                      <p>
                        <strong>Date:</strong> {new Date(announcement.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {announcement.files && announcement.files.length > 0 && (
                      <div style={{ marginTop: "16px", border: "1px solid #f0f0f0", borderRadius: "4px", padding: "12px", backgroundColor: "#fafafa" }}>
                        <h4 style={{ marginTop: 0, marginBottom: "12px", borderBottom: "1px solid #f0f0f0", paddingBottom: "8px", fontSize: "14px", color: "#333" }}>
                          Attached Files ({announcement.files.length})
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {announcement.files.map((file, index) => (
                            <div key={index} style={{ display: "flex", alignItems: "center", padding: "8px", backgroundColor: "#fff", borderRadius: "4px", border: "1px solid #eee" }}>
                              <div style={{ marginRight: "10px" }}>{getFileIcon(file.originalname || file.name)}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: "500" }}>{file.originalname || file.name}</div>
                                <div style={{ fontSize: "12px", color: "#888" }}>{file.size ? `${(file.size / 1024).toFixed(2)} KB` : ""}</div>
                              </div>
                              <div style={{ display: "flex", gap: "8px" }}>
                                {isViewable(file.originalname || file.name) && (
                                  <Button type="text" icon={<EyeOutlined />} onClick={() => window.open(getViewUrl(file))} />
                                )}
                                <Button type="text" icon={<DownloadOutlined />} onClick={() => handleFileDownload(file)} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Collapse.Panel>
              </Collapse>
            ))}
          </div>
        </Card>
      )}

      <Modal
        title="Download Approved Applications"
        open={isDownloadModalVisible}
        onCancel={() => setIsDownloadModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsDownloadModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="download"
            type="primary"
            onClick={downloadApprovedRequests}
            disabled={!selectedCourseForDownload}
            loading={loadingCourses}
          >
            Download
          </Button>,
        ]}
      >
        <Select
          style={{ width: "100%" }}
          placeholder="Select Course"
          onChange={(value) => setSelectedCourseForDownload(value)}
          loading={loadingCourses}
        >
          {courses.map((course) => (
            <Select.Option key={course._id} value={course._id}>
              {course.courseName} ({course.courseCode})
            </Select.Option>
          ))}
        </Select>
      </Modal>

      {/* Student Creation Modal */}
      <Modal
        title="Add New Student"
        open={isStudentCreateModel}
        onCancel={() => setIsStudentCreateModel(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form form={form2} layout="vertical" onFinish={handleStudentSubmit}>
          <Form.Item
            name="name"
            label="Name"
            rules={[
              { required: true, message: "Please enter student name!" },
            ]}
          >
            <Input placeholder="Enter student name" />
          </Form.Item>

          <Form.Item
            name="surname"
            label="Surname"
            rules={[
              { required: true, message: "Please enter student surname!" },
            ]}
          >
            <Input placeholder="Enter student surname" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email address!" },
              { type: "email", message: "Please enter a valid email address!" },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: "Please select department!" }]}
          >
            <Select placeholder="Select department">
              {departments.map((dept) => (
                <Option key={dept} value={dept}>
                  {dept}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="studentNumber"
            label="Student Number"
            rules={[
              { required: true, message: "Please enter student number!" },
            ]}
          >
            <Input placeholder="Enter student number" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please enter password!" },
              { min: 3, message: "Password must be at least 3 characters long!" },
            ]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end space-x-3">
              <Button onClick={() => setIsStudentCreateModel(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Instructor Creation Modal */}
      <Modal
        title="Add New Instructor"
        open={isInstructorCreateModel}
        onCancel={() => setIsInstructorCreateModel(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form form={form3} layout="vertical" onFinish={handleInstructorSubmit}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter name!" }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>

          <Form.Item
            name="surname"
            label="Surname"
            rules={[{ required: true, message: "Please enter surname!" }]}
          >
            <Input placeholder="Enter surname" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email address!" },
              { type: "email", message: "Please enter a valid email address!" },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: "Please select department!" }]}
          >
            <Select placeholder="Select department">
              {departments.map((dept) => (
                <Option key={dept} value={dept}>
                  {dept}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please enter password!" },
              { min: 3, message: "Password must be at least 3 characters long!" },
            ]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end space-x-3">
              <Button onClick={() => setIsInstructorCreateModel(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Exam Creation Modal */}
      <Modal
        title="Add New Exam"
        open={isExamCreateModal}
        onCancel={() => setIsExamCreateModal(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form form={examForm} layout="vertical" onFinish={handleExamSubmit}>
          <Form.Item
            name="title"
            label="Exam Title"
            rules={[
              { required: true, message: "Please enter exam title!" },
            ]}
          >
            <Input placeholder="Enter exam title" />
          </Form.Item>

          <Form.Item
            name="courseId"
            label="Course"
            rules={[{ required: true, message: "Please select course!" }]}
          >
            <Select placeholder="Select course">
              {courses.map((course) => (
                <Option key={course._id} value={course._id}>
                  {course.courseName} ({course.courseCode})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="Exam Date"
            rules={[
              { required: true, message: "Please select exam date!" },
            ]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Exam Duration (Minutes)"
            rules={[
              { required: true, message: "Please enter exam duration!" },
            ]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="location"
            label="Exam Location"
            rules={[
              { required: true, message: "Please enter exam location!" },
            ]}
          >
            <Input placeholder="Enter exam location" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Exam Type"
            rules={[
              { required: true, message: "Please select exam type!" },
            ]}
          >
            <Select placeholder="Select exam type">
              <Option value="oral">Oral</Option>
              <Option value="written">Written</Option>
              <Option value="classical">Classical</Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={4} placeholder="Enter exam description" />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end space-x-3">
              <Button onClick={() => setIsExamCreateModal(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Announcement Creation Modal */}
      <Modal
        title="Create New Announcement"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAnnouncementSubmit}>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter title!" }]}
          >
            <Input placeholder="Enter announcement title" />
          </Form.Item>

          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: "Please select department!" }]}
          >
            <Select placeholder="Select department">
              {departments.map((dept) => (
                <Option key={dept} value={dept}>
                  {dept}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="type"
            label="Announcement Type"
            rules={[
              { required: true, message: "Please select announcement type!" },
            ]}
          >
            <Select placeholder="Select announcement type">
              <Select.Option value="finals">Final</Select.Option>
              <Select.Option value="makeup">Makeup</Select.Option>
              <Select.Option value="normal">Normal</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: "Please enter content!" }]}
          >
            <Input.TextArea placeholder="Enter announcement content" rows={4} />
          </Form.Item>


          <Form.Item>
            <div className="flex justify-end space-x-3">
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Exam Template Download Modal */}
      <Modal
        title="Download Exam Template"
        open={isExamTemplateModalVisible}
        onCancel={() => setIsExamTemplateModalVisible(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsExamTemplateModalVisible(false)}
          >
            Cancel
          </Button>,
          <Button
            key="download"
            type="primary"
            onClick={downloadExamTemplate}
            loading={loadingCourses}
          >
            Download Template
          </Button>,
        ]}
      >
        <p>You are about to download the exam template for all courses.</p>

        <div style={{ marginTop: "16px" }}>
          <p>Note:</p>
          <ul>
            <li>
              All fields in the template are filled with example data:
            </li>
            <ul>
              <li>Course IDs and names (courseId, courseName)</li>
              <li>Exam title (title): "Example Exam: [Course Name]"</li>
              <li>Date (date): in "2025-12-31T10:00:00" format</li>
              <li>Duration (duration): 60 minutes</li>
              <li>Location (location): "A-101 Classroom"</li>
              <li>Description (description): "Explan"</li>
              <li>Type (type): "classical"</li>
            </ul>
            <li>To use the template:</li>
            <ul>
              <li>You can delete rows for unnecessary courses</li>
              <li>
                Replace example data with your exam information
              </li>
              <li>
                To add multiple exams for the same course, copy and paste the row
              </li>
              <li>Remember to edit the template before uploading!</li>
            </ul>
          </ul>
        </div>
      </Modal>

      {/* Exam File Upload Modal */}
      <Modal
        title="Add Exam via File"
        open={isExamUploadModalVisible}
        onCancel={() => {
          setIsExamUploadModalVisible(false);
          setExamFileList([]);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsExamUploadModalVisible(false);
              setExamFileList([]);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="upload"
            type="primary"
            onClick={handleExamFileUpload}
            disabled={examFileList.length === 0}
            loading={uploadLoading}
          >
            Upload and Create Exams
          </Button>,
        ]}
      >
        <p>Upload your Excel file prepared from the exam template:</p>

        <Upload
          listType="text"
          fileList={examFileList}
          onChange={({ fileList }) => setExamFileList(fileList)}
          beforeUpload={(file) => {
            const isExcel =
              file.type ===
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
              file.type === "application/vnd.ms-excel";
            if (!isExcel) {
              message.error("Only Excel (.xlsx) files are allowed!");
              return Upload.LIST_IGNORE;
            }
            return false;
          }}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Select Excel File</Button>
        </Upload>

        <div style={{ marginTop: "16px" }}>
          <p>Note:</p>
          <ul>
            <li>Only Excel (.xlsx) files are allowed</li>
            <li>
              It is recommended to download the template first
            </li>
            <li>
              All required fields must be filled
            </li>
            <li>
              One row corresponds to one exam
            </li>
            <li>
              You can upload multiple exams for different courses at once
            </li>
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardSecr;
