import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Grades from "../../component/Grades";
import {
  message,
  Card,
  Button,
  Space,
  Typography,
  Modal,
  Select,
  Table,
  Descriptions,
  Divider,
  Collapse,
} from "antd";
import NotificationDropdown from "../../component/NotificationDropdown";
import "./Dashboard.css"; // Yeni CSS dosyası
import {
  InfoCircleOutlined,
  DownloadOutlined,
  PaperClipOutlined,
  EyeOutlined,
  UserOutlined,
  BankOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { saveAs } from "file-saver";
import {
  FilePdfOutlined,
  FileImageOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileZipOutlined,
  FileTextOutlined,
  FileOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    studentInfo: null,
    courses: [],
  });
  const [loading, setLoading] = useState({
    student: true,
    courses: false,
    requests: false,
    messages: false,
    instructors: false,
    availableCourses: false,
  });
  const [error, setError] = useState(null);
  const [showRequests, setShowRequests] = useState(false);
  const [makeupRequests, setMakeupRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [showMessages, setShowMessages] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [file, setFile] = useState(null);
  const [conversations, setConversations] = useState({});
  const [activeConversation, setActiveConversation] = useState(null);
  const messagesEndRef = useRef(null);
  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);
  // New state variables for course registration
  const [isTakeCoursesModalVisible, setIsTakeCoursesModalVisible] =
    useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [departmentInstructors, setDepartmentInstructors] = useState([]);
  const [showMyCourses, setShowMyCourses] = useState(false);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);
  const [isCourseDetailsModalVisible, setIsCourseDetailsModalVisible] =
    useState(false);
  const [showExams, setShowExams] = useState(false);
  const [myCourses, setMyCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [hiddenAnnouncements, setHiddenAnnouncements] = useState([]);
  const [showAnnouncements, setShowAnnouncements] = useState(true);
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        setError(null);
        const response = await axiosInstance.get("/api/get/student/info");
        setData((prev) => ({ ...prev, studentInfo: response.data.data }));
        // Öğrenci bilgileri alındıktan sonra duyuruları getir
        fetchAnnouncements();
      } catch (err) {
        setError(err.response?.data?.message || "Öğrenci bilgileri alınamadı");
      } finally {
        setLoading((prev) => ({ ...prev, student: false }));
      }
    };

    fetchStudentInfo();
  }, []);

  const fetchInstructors = async () => {
    try {
      setLoading((prev) => ({ ...prev, instructors: true }));
      const response = await axiosInstance.get("/api/instructor");
      console.log("Eğitmenler yüklendi:", response.data); // Debug
      setInstructors(response.data);
    } catch (err) {
      console.error("Eğitmen yükleme hatası:", err); // Debug
      setError("Eğitmenler yüklenirken hata oluştu");
    } finally {
      setLoading((prev) => ({ ...prev, instructors: false }));
    }
  };

  const fetchMessages = async (instructorId) => {
    try {
      if (!data.studentInfo?._id) {
        message.error("Öğrenci bilgileri yüklenmedi");
        return;
      }

      console.log("Mesajlar yükleniyor için:", {
        studentId: data.studentInfo._id,
        instructorId,
      }); // Debug

      const response = await axiosInstance.get(
        `/api/messages/${data.studentInfo._id}/${instructorId}`
      );

      console.log("Mesajlar yüklendi:", response.data); // Debug

      setMessages(response.data);
      setActiveConversation(instructorId);
      setSelectedInstructor(instructorId);

      setConversations((prev) => ({
        ...prev,
        [instructorId]: response.data,
      }));

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Mesaj yükleme hatası:", error); // Debug
      message.error("Mesajlar yüklenemedi");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    console.log("Gönder butonuna basıldı");

    // Öğrenci bilgilerinin yüklendiğinden emin ol
    if (!data.studentInfo?._id) {
      console.error("Öğrenci ID'si yüklenmedi:", data.studentInfo);
      message.error("Öğrenci bilgileri yüklenmedi. Lütfen bekleyin...");
      return;
    }

    if (!newMessage.trim()) {
      message.error("Mesaj boş olamaz");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("senderId", data.studentInfo._id); // Bu satırı kontrol et
      formData.append("receiverId", activeConversation);
      formData.append("content", newMessage);
      formData.append("senderModel", "Student");
      formData.append("receiverModel", "Instructor");

      // Debug için formData içeriğini logla
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await axiosInstance.post("/api/messages", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // ... diğer işlemler
    } catch (error) {
      console.error("Mesaj gönderme hatası:", {
        error: error.response?.data,
        status: error.response?.status,
      });
      message.error(error.response?.data?.error || "Mesaj gönderilemedi");
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const makeup = () => {
    navigate("/student/makeup");
  };

  const fetchGrades = async () => {
    try {
      // If already showing grades, hide them
      if (
        data.courses.length > 0 &&
        !showRequests &&
        !showMessages &&
        !showExams &&
        !showMyCourses
      ) {
        setData((prev) => ({ ...prev, courses: [] }));
        return;
      }

      setLoading((prev) => ({ ...prev, courses: true }));
      setError(null);
      const response = await axiosInstance.get("/api/course/getMy");
      console.log("ders notları", response.data);
      setData((prev) => ({ ...prev, courses: response.data.courses || [] }));
      setShowMyCourses(false);
      setShowRequests(false);
      setShowMessages(false);
      setShowExams(false);
    } catch (err) {
      setError(err.response?.data?.message || "Ders notları alınamadı");
    } finally {
      setLoading((prev) => ({ ...prev, courses: false }));
    }
  };

  const fetchMakeupRequests = async () => {
    try {
      // If already showing requests, hide them
      if (showRequests) {
        setShowRequests(false);
        return;
      }

      setLoading((prev) => ({ ...prev, requests: true }));
      setError(null);
      const response = await axiosInstance.get("/api/student/makeup/req");
      setMakeupRequests(response.data);
      setShowRequests(true);
      setShowMyCourses(false);
      setShowMessages(false);
      setShowExams(false);
      setData((prev) => ({ ...prev, courses: [] }));
    } catch (err) {
      setError(err.response?.data?.message || "Büt istekleri alınamadı");
    } finally {
      setLoading((prev) => ({ ...prev, requests: false }));
    }
  };
  const navigateToAnnouncements = () => {
    navigate("/announcement");
  };

  const getGradeColor = (grade) => {
    if (!grade) return "#333";
    const excellent = ["AA", "BA", "BB"];
    const good = ["CB", "CC"];
    const passing = ["DC", "DD"];

    if (excellent.includes(grade)) return "#2e7d32";
    if (good.includes(grade)) return "#689f38";
    if (passing.includes(grade)) return "#ef6c00";
    if (grade === "FF") return "#c62828";
    return "#333";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#4CAF50";
      case "rejected":
        return "#F44336";
      case "pending":
        return "#FFC107";
      default:
        return "#9E9E9E";
    }
  };

  const toggleMessages = () => {
    if (!showMessages) {
      fetchInstructors();
      setShowMyCourses(false);
      setShowRequests(false);
      setShowExams(false);
      setData((prev) => ({ ...prev, courses: [] }));
    }
    setShowMessages(!showMessages);
  };

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setExamsLoading(true);
        const response = await axiosInstance.get("/api/exam/student");
        setExams(response.data);
      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setExamsLoading(false);
      }
    };

    fetchExams();
  }, []);

  const fetchAvailableCourses = async () => {
    try {
      setLoading((prev) => ({ ...prev, availableCourses: true }));

      // Use /api/course/all to get all courses from all departments
      const response = await axiosInstance.get("/api/course/all");
      console.log("All available courses:", response.data); // Debug log

      // Filter out any courses that might be duplicates
      const uniqueCourses = response.data.filter(
        (course, index, self) =>
          index === self.findIndex((c) => c._id === course._id)
      );

      setAvailableCourses(uniqueCourses);
    } catch (error) {
      console.error("Error fetching available courses:", error);

      // Fallback to the original endpoint if the /all endpoint fails
      try {
        const fallbackResponse = await axiosInstance.get(
          "/api/course/available"
        );
        console.log("Fallback - available courses:", fallbackResponse.data);
        setAvailableCourses(fallbackResponse.data);
      } catch (fallbackError) {
        console.error("Error with fallback course fetch:", fallbackError);
        message.error("Dersler yüklenirken hata oluştu");
      }
    } finally {
      setLoading((prev) => ({ ...prev, availableCourses: false }));
    }
  };

  const fetchDepartmentInstructors = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/department/instructors/${data.studentInfo?.department}`
      );
      setDepartmentInstructors(response.data);
    } catch (error) {
      console.error("Error fetching department instructors:", error);
      message.error("Öğretim üyeleri yüklenirken hata oluştu");
    }
  };

  const handleCourseSelection = (selectedCourseIds) => {
    setSelectedCourses(selectedCourseIds);
  };

  const handleCourseRegistration = async () => {
    try {
      console.log("Attempting to register courses:", selectedCourses);

      if (!selectedCourses || selectedCourses.length === 0) {
        message.error("Lütfen en az bir ders seçiniz");
        return;
      }

      if (selectedCourses.length > 5) {
        message.error("En fazla 5 ders seçebilirsiniz");
        return;
      }

      // Ensure we have a valid student ID
      if (!data.studentInfo || !data.studentInfo._id) {
        message.error("Öğrenci bilgileri yüklenemedi. Sayfayı yenileyiniz.");
        return;
      }

      // Make sure all selected course IDs are valid
      if (selectedCourses.some((id) => typeof id !== "string" || !id.trim())) {
        message.error(
          "Seçilen derslerden bazıları geçersiz. Lütfen tekrar seçim yapınız."
        );
        return;
      }

      // Deep clone the courses array to avoid reference issues
      const coursesToSend = JSON.parse(JSON.stringify(selectedCourses));

      const requestData = {
        courses: coursesToSend,
        studentId: data.studentInfo._id, // Explicitly include student ID
        initialGrade: "NA", // Use NA as the initial grade for new course registrations
      };

      console.log(
        "Sending request with data:",
        JSON.stringify(requestData, null, 2)
      );

      // Show loading message
      const loadingMessage = message.loading("Ders kaydı yapılıyor...", 0);

      // Set timeout to handle very slow responses
      const timeoutId = setTimeout(() => {
        message.warning("İşlem beklenenden uzun sürüyor. Lütfen bekleyiniz...");
      }, 5000);

      try {
        // Set a longer timeout for this specific request
        const response = await axiosInstance.post(
          "/api/student/register-courses",
          requestData,
          { timeout: 10000 } // 10 second timeout
        );

        // Clear timeout and loading message
        clearTimeout(timeoutId);
        loadingMessage();

        // Check if the response indicates success
        if (response.data && response.status === 200) {
          console.log("Registration successful:", response.data);
          message.success(response.data.message || "Dersler başarıyla eklendi");
          setIsTakeCoursesModalVisible(false);
          setSelectedCourses([]); // Reset selected courses

          // Fetch updated courses list
          setTimeout(() => {
            handleShowMyCourses();
          }, 1000);
        } else {
          // Handle unexpected response format
          console.warn("Unexpected response format:", response);
          message.warning(
            "Ders kaydı yapıldı ancak güncel bilgileri almak için sayfayı yenileyiniz"
          );
          setIsTakeCoursesModalVisible(false);
        }
      } catch (error) {
        // Clear timeout and loading message
        clearTimeout(timeoutId);
        loadingMessage();

        console.error("Error registering courses:", error);

        // Detailed error logging
        console.error("Error details:", {
          response: error.response?.data,
          status: error.response?.status,
          message: error.message,
          stack: error.stack,
        });

        // Handle specific error cases
        if (
          error.response?.status === 400 &&
          error.response?.data?.existingCourses
        ) {
          message.warning("Bazı dersler zaten kayıtlı");
        } else if (error.response?.status === 500) {
          // Check if the error message contains any useful information
          const errorDetails = error.response?.data?.error || error.message;
          console.log("Server error details:", errorDetails);

          // Handle letterGrade validation error specifically
          if (
            errorDetails &&
            errorDetails.includes("letterGrade") &&
            errorDetails.includes("NA")
          ) {
            message.warning(
              "Sunucu yapılandırmasında 'NA' not değeri tanımlı değil. Lütfen sistem yöneticisine başvurun."
            );

            // Try an alternative approach - use a different valid grade
            try {
              console.log(
                "Attempting alternative registration with NA grade..."
              );
              // Create a modified request with NA as the initial grade
              const modifiedRequest = {
                ...requestData,
                initialGrade: "NA", // Use NA as initial grade
              };

              await new Promise((resolve) => setTimeout(resolve, 1000));

              const altResponse = await axiosInstance.post(
                "/api/student/register-courses",
                modifiedRequest
              );

              if (altResponse.status === 200) {
                message.success("The course registration has been completed successfully!");
                setIsTakeCoursesModalVisible(false);
                setSelectedCourses([]);

                setTimeout(() => {
                  handleShowMyCourses();
                }, 1000);
                return;
              }
            } catch (altError) {
              console.error("Alternative grade registration failed:", altError);
            }
          }

          // Try a different approach to register the course - with a direct ID array
          if (selectedCourses.length === 1) {
            try {
              console.log("Attempting alternative registration approach...");
              // Wait a moment before trying again
              await new Promise((resolve) => setTimeout(resolve, 1000));

              // Try posting just the course ID directly
              const altResponse = await axiosInstance.post(
                "/api/student/register-courses",
                selectedCourses
              );

              console.log(
                "Alternative registration response:",
                altResponse.data
              );
              if (altResponse.status === 200) {
                message.success("The course registration has been completed successfully!");
                setIsTakeCoursesModalVisible(false);
                setSelectedCourses([]);

                // Refresh courses list
                setTimeout(() => {
                  handleShowMyCourses();
                }, 1000);
                return;
              }
            } catch (altError) {
              console.error("Alternative registration also failed:", altError);
            }
          }

          // Wait a moment and refresh courses to see if registration actually succeeded
          setTimeout(() => {
            handleShowMyCourses();
          }, 2000);
        } else {
          message.error(
            error.response?.data?.message ||
              "Ders kaydı sırasında bir hata oluştu"
          );
        }

        setIsTakeCoursesModalVisible(false);
      }
    } catch (outerError) {
      // This catches any error in the outer try block
      console.error(
        "Unexpected error in handleCourseRegistration:",
        outerError
      );
      message.error(
        "Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz."
      );
      setIsTakeCoursesModalVisible(false);
    }
  };

  const handleShowCourseDetails = (course) => {
    setSelectedCourseDetails(course);
    setIsCourseDetailsModalVisible(true);
  };

  const handleShowMyCourses = async () => {
    try {
      // If already showing courses, hide them
      if (showMyCourses) {
        setShowMyCourses(false);
        return;
      }

      setLoading((prev) => ({ ...prev, courses: true }));
      setError(null);
      const response = await axiosInstance.get("/api/course/getMy");
      console.log("Fetched courses:", response.data);

      // Make sure we're correctly setting the courses
      const courses = response.data.courses || [];
      setMyCourses(courses);
      setShowMyCourses(true);
      setShowRequests(false);
      setShowMessages(false);
      setShowExams(false);
      setData((prev) => ({ ...prev, courses: [] })); // Clear grades display
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err.response?.data?.message || "Dersler alınamadı");
      message.error("Dersler yüklenirken bir hata oluştu");
    } finally {
      setLoading((prev) => ({ ...prev, courses: false }));
    }
  };

  const handleShowExams = async () => {
    try {
      // If already showing exams, hide them
      if (showExams) {
        setShowExams(false);
        return;
      }

      setExamsLoading(true);
      setShowMyCourses(false);
      setShowRequests(false);
      setShowMessages(false);
      setData((prev) => ({ ...prev, courses: [] }));
      const response = await axiosInstance.get("/api/exam/student");
      setExams(response.data);
      setShowExams(true);
    } catch (error) {
      console.error("Error fetching exams:", error);
      message.error("Sınavlar yüklenirken bir hata oluştu");
    } finally {
      setExamsLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await axiosInstance.get("/api/announcement");
      console.log("The announcements were successfully received!");
      console.log("Raw announcements from the backend:", response.data);
      console.log("Total number of announcements:", response.data.length);
      console.log("Student department:", data.studentInfo?.department);

      if (response.data.length === 0) {
        console.log("Warning: No announcements received from backend!");
      }

      // Check and fix department and type information for each announcement
      const processedAnnouncements = response.data.map((announcement) => {
        // If department information is missing, assign student's department
        if (!announcement.department || announcement.department === "") {
          console.log(`Fixing announcement with missing department:`, {
            id: announcement._id,
            title: announcement.title,
          });
          announcement.department = data.studentInfo?.department || "General";
        }

        if (!announcement.type) {
          console.log(`Fixing announcement with missing type:`, {
            id: announcement._id,
            title: announcement.title,
          });
          // Complete missing type information
          announcement.type = "normal";
        }

        return announcement;
      });

      console.log("Processed announcements:", processedAnnouncements);
      setAnnouncements(processedAnnouncements);
    } catch (error) {
      console.error("Error loading announcements:", error);
      message.error("Error occurred while loading announcements");
    }
  };

  useEffect(() => {
    // Gizli duyuruları local storage'dan al
    const savedHiddenAnnouncements = localStorage.getItem(
      "hiddenAnnouncements"
    );
    if (savedHiddenAnnouncements) {
      setHiddenAnnouncements(JSON.parse(savedHiddenAnnouncements));
    }
  }, []);

  useEffect(() => {
    if (!data.studentInfo?.department) {
      console.log("Öğrenci departman bilgisi henüz yüklenmedi");
      return;
    }

    console.log("Duyurular filtreleniyor...");
    console.log("Seçili tür:", selectedType);
    console.log("Öğrenci departmanı:", data.studentInfo?.department);
    console.log(
      "Toplam duyuru sayısı (filtreleme öncesi):",
      announcements.length
    );

    let filtered = announcements.filter((announcement) => {
      // Duyuru detaylarını logla
      console.log("Duyuru işleniyor:", {
        id: announcement._id,
        title: announcement.title,
        type: announcement.type,
        department: announcement.department,
      });

      // Gizli duyuruları kontrol et
      if (hiddenAnnouncements.includes(announcement._id)) {
        console.log(`Duyuru gizli, gösterilmeyecek: ${announcement._id}`);
        return false;
      }

      // Tür kontrolü
      const typeMatch = selectedType
        ? announcement.type === selectedType
        : true;

      console.log("Duyuru filtreleme sonucu:", {
        id: announcement._id,
        title: announcement.title,
        typeMatch,
        willShow: typeMatch,
      });

      return typeMatch;
    });

    // Tarihe göre sırala (en yeni en üstte)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log("Filtreleme sonrası duyurular:", filtered.length);
    setFilteredAnnouncements(filtered);
  }, [
    announcements,
    selectedType,
    data.studentInfo?.department,
    hiddenAnnouncements,
  ]);

  const handleTypeFilter = (type) => {
    if (type === selectedType) {
      // Aynı butona tıklandığında toggle yap
      setShowAnnouncements(!showAnnouncements);
      if (!showAnnouncements) {
        setSelectedType(null);
      }
    } else {
      // Farklı butona tıklandığında
      setSelectedType(type);
      setShowAnnouncements(true);
    }
  };

  // Duyuru gizleme fonksiyonu ekle
  const hideAnnouncement = (announcementId) => {
    const updatedHiddenAnnouncements = [...hiddenAnnouncements, announcementId];
    setHiddenAnnouncements(updatedHiddenAnnouncements);

    // Local storage'a kaydet
    localStorage.setItem(
      "hiddenAnnouncements",
      JSON.stringify(updatedHiddenAnnouncements)
    );

    message.success("Duyuru gizlendi");
  };

  // Dosya tipine göre simge döndüren yardımcı fonksiyon
  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();

    switch (extension) {
      case "pdf":
        return (
          <FilePdfOutlined style={{ fontSize: "20px", color: "#ff4d4f" }} />
        );
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "bmp":
        return (
          <FileImageOutlined style={{ fontSize: "20px", color: "#1890ff" }} />
        );
      case "doc":
      case "docx":
        return (
          <FileWordOutlined style={{ fontSize: "20px", color: "#2a5699" }} />
        );
      case "xls":
      case "xlsx":
        return (
          <FileExcelOutlined style={{ fontSize: "20px", color: "#217346" }} />
        );
      case "ppt":
      case "pptx":
        return (
          <FilePptOutlined style={{ fontSize: "20px", color: "#d24726" }} />
        );
      case "zip":
      case "rar":
      case "7z":
        return (
          <FileZipOutlined style={{ fontSize: "20px", color: "#faad14" }} />
        );
      case "txt":
        return (
          <FileTextOutlined style={{ fontSize: "20px", color: "#8c8c8c" }} />
        );
      default:
        return <FileOutlined style={{ fontSize: "20px", color: "#8c8c8c" }} />;
    }
  };

  // Dosya görüntülenebilir mi?
  const isViewable = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    return ["pdf", "jpg", "jpeg", "png", "gif", "bmp", "txt"].includes(
      extension
    );
  };

  // Dosya URL'lerini oluşturmak için yardımcı fonksiyon
  const getFileUrl = (file) => {
    // Eğer tam URL varsa onu kullan
    if (file.url && file.url.startsWith("http")) {
      return file.url;
    }

    // Path veya filename'den URL oluştur
    let filename;
    if (file.path) {
      // Handle both forward and backward slashes for cross-platform compatibility
      const pathParts = file.path.split(/[/\\]/);
      filename = pathParts[pathParts.length - 1];
    } else if (file.filename) {
      filename = file.filename;
    }

    if (filename) {
      // Make sure we don't have path duplication
      const cleanFilename = filename.replace(/^uploads[/\\]/, "");
      return `/uploads/${cleanFilename}`;
    }

    // Başka bir durum olursa
    return file.url || "";
  };

  // Dosya tipine göre görüntüleme URL'i oluştur
  const getViewUrl = (file) => {
    // Path veya filename'den URL oluştur
    let filename;

    if (file.path) {
      // Handle both forward and backward slashes for cross-platform compatibility
      const pathParts = file.path.split(/[/\\]/);
      filename = pathParts[pathParts.length - 1];
    } else if (file.filename) {
      filename = file.filename;
    }

    if (filename) {
      // Make sure we don't have path duplication
      const cleanFilename = filename.replace(/^uploads[/\\]/, "");
      return `/uploads/${cleanFilename}`;
    }

    // Başka bir durum olursa
    return file.url || "";
  };

  const handleDownload = async (file) => {
    try {
      console.log("Handling file:", file);

      // For students, we should use the student-specific endpoint
      const fileDetails = {
        originalName: file.originalname || file.name,
        path: file.path,
        filename: file.filename,
        url: file.url,
      };
      console.log("File details:", fileDetails);

      // Get the token for authentication
      const token = localStorage.getItem("token");

      let filename;
      // Determine the filename from either path or filename property
      if (file.path) {
        // Handle both forward and backward slashes for cross-platform compatibility
        const pathParts = file.path.split(/[/\\]/);
        filename = pathParts[pathParts.length - 1];
      } else if (file.filename) {
        filename = file.filename;
      }

      if (filename) {
        try {
          // Use our new student-specific endpoint
          console.log(`Downloading file using student endpoint: ${filename}`);
          const response = await axiosInstance.get(
            `/api/student/files/${filename}`,
            {
              responseType: "blob",
              headers: {
                Authorization: token ? `Bearer ${token}` : "",
              },
            }
          );

          saveAs(new Blob([response.data]), file.originalname || file.name);
          message.success("Dosya başarıyla indirildi");
          return;
        } catch (downloadErr) {
          console.error("Student download failed:", downloadErr);

          // Fallback to direct URL access
          try {
            // Make sure we don't have path duplication and no backslashes
            const cleanFilename = filename.replace(/^uploads[/\\]/, "");
            const fileUrl = `/uploads/${cleanFilename}`;
            console.log(`Fallback: Attempting to open file at: ${fileUrl}`);
            window.open(fileUrl, "_blank");
            return;
          } catch (urlErr) {
            console.error("URL access failed:", urlErr);
          }
        }
      }

      // If we have a URL, use it as last resort
      if (file.url) {
        console.log(`Opening file with URL: ${file.url}`);
        window.open(file.url, "_blank");
        return;
      }

      message.error(
        "Could not access file. Please contact your instructor."
      );
    } catch (err) {
      console.error("File processing error:", err);
      message.error(
        "An error occurred while opening the file. Please try again later."
      );
    }
  };

  useEffect(() => {
    if (availableCourses.length > 0) {
      setFilteredCourses(availableCourses);
    }
  }, [availableCourses]);

  if (loading.student) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red", textAlign: "center" }}>
        {error}
      </div>
    );
  }

  if (!data.studentInfo) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Student information not found
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Title level={2}>Student Dashboard</Title>
        <Space>
          <NotificationDropdown />
          <Button 
            danger 
            onClick={onLogout}
            style={{
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              zIndex: 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.backgroundColor = '#ff4d4f';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '';
              e.currentTarget.style.backgroundColor = '';
            }}
          >
            Logout
          </Button>
          <Button onClick={navigateToAnnouncements}>
            View Announcements
          </Button>
        </Space>
      </div>

      <Card 
        title="Student Information" 
        style={{ 
          marginBottom: "24px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}
      >
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "24px",
          padding: "16px"
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <UserOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
              <div>
                <div style={{ color: "#666", fontSize: "14px" }}>Name</div>
                <div style={{ fontSize: "16px", fontWeight: "500" }}>{data.studentInfo.name}</div>
              </div>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <UserOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
              <div>
                <div style={{ color: "#666", fontSize: "14px" }}>Surname</div>
                <div style={{ fontSize: "16px", fontWeight: "500" }}>{data.studentInfo.surname}</div>
              </div>
            </div>
          </div>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <BankOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
              <div>
                <div style={{ color: "#666", fontSize: "14px" }}>Department</div>
                <div style={{ fontSize: "16px", fontWeight: "500" }}>{data.studentInfo.department}</div>
              </div>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <MailOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
              <div>
                <div style={{ color: "#666", fontSize: "14px" }}>Email</div>
                <div style={{ fontSize: "16px", fontWeight: "500" }}>{data.studentInfo.email}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Kontrol Butonları */}
      <div className="control-buttons" style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        marginTop: '24px'
      }}>
        <button
          onClick={fetchGrades}
          disabled={loading.courses}
          className={`control-button ${loading.courses ? "loading" : ""}`}
        >
          {loading.courses ? "Loading..." : "Show My Grades"}
        </button>

        <button
          onClick={fetchMakeupRequests}
          disabled={loading.requests}
          className={`control-button ${loading.requests ? "loading" : ""}`}
        >
          {loading.requests ? "Loading..." : "My Makeup Requests"}
        </button>

        <button
          onClick={makeup}
          className="control-button makeup-button"
        >
          Create New Request
        </button>

        <button
          onClick={handleShowExams}
          disabled={examsLoading}
          className={`control-button ${examsLoading ? "loading" : ""}`}
        >
          {examsLoading ? "Loading..." : "My Exams"}
        </button>
      </div>

      {/* Mesajlaşma Bölümü */}
      {showMessages && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "15px",
            backgroundColor: "#f9f9f9",
            marginBottom: "20px",
            minHeight: "500px",
          }}
        >
          {!activeConversation ? (
            // EĞİTMEN LİSTELEME BÖLÜMÜ
            <div>
              <h3 style={{ marginBottom: "15px" }}>
              Choose a trainer to text
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: "10px",
                }}
              >
                {instructors.map((instructor) => (
                  <div
                    key={instructor._id}
                    onClick={() => {
                      console.log("Eğitmen seçildi:", instructor._id);
                      setActiveConversation(instructor._id);
                      fetchMessages(instructor._id);
                    }}
                    style={{
                      padding: "15px",
                      border: "1px solid #eee",
                      borderRadius: "5px",
                      cursor: "pointer",
                      backgroundColor: "#fff",
                      transition: "all 0.3s",
                      ":hover": {
                        borderColor: "#1890ff",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      },
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>
                        {instructor.name} {instructor.surname}
                      </span>
                      {conversations[instructor._id]?.length > 0 && (
                        <span
                          style={{
                            backgroundColor: "#ff4d4f",
                            color: "white",
                            borderRadius: "50%",
                            width: "22px",
                            height: "22px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                          }}
                        >
                          {conversations[instructor._id].length}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // MESAJLAŞMA BÖLÜMÜ
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              {/* BAŞLIK VE GERİ BUTONU */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "10px",
                  marginBottom: "15px",
                  borderBottom: "1px solid #eee",
                }}
              >
                <button
                  onClick={() => setActiveConversation(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#1890ff",
                    fontSize: "16px",
                  }}
                >
                  ← Come back
                </button>
                <h3 style={{ margin: 0 }}>
                  {instructors.find((i) => i._id === activeConversation)?.name}{" "}
                  {
                    instructors.find((i) => i._id === activeConversation)
                      ?.surname
                  }
                </h3>
              </div>

              {/* MESAJ LİSTESİ */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  marginBottom: "15px",
                  padding: "10px",
                  backgroundColor: "white",
                  borderRadius: "4px",
                  border: "1px solid #eee",
                }}
              >
                {messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      style={{
                        maxWidth: "70%",
                        padding: "8px 12px",
                        marginBottom: "10px",
                        borderRadius: "12px",
                        backgroundColor:
                          msg.senderModel === "Student" ? "#d4edda" : "#f8f9fa",
                        marginLeft:
                          msg.senderModel === "Student" ? "auto" : "0",
                      }}
                    >
                      <p style={{ margin: 0 }}>{msg.message}</p>
                      {msg.fileUrl && (
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "block",
                            marginTop: "5px",
                            color: "#1890ff",
                          }}
                        >
                          📎 Attached File
                        </a>
                      )}
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "#666",
                          display: "block",
                          textAlign: "right",
                        }}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: "center", color: "#666" }}>
                    No messages yet
                  </p>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* MESAJ YAZMA FORMU */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  display: "flex",
                  gap: "10px",
                  paddingTop: "10px",
                  borderTop: "1px solid #eee",
                }}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  style={{
                    cursor: "pointer",
                    padding: "8px",
                    fontSize: "18px",
                  }}
                >
                  📎
                </label>

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    padding: "10px 15px",
                    border: "1px solid #ddd",
                    borderRadius: "20px",
                    outline: "none",
                  }}
                />

                <button
                  type="submit"
                  style={{
                    padding: "0 20px",
                    background: "#1890ff",
                    color: "white",
                    border: "none",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                  disabled={!newMessage.trim()}
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      )}
      {/* Büt İstekleri */}
      {showRequests && (
        <div className="requests-container">
          <h2>Resit Exam Requests</h2>
          {makeupRequests.length > 0 ? (
            <div className="requests-table-container">
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>Lesson</th>
                    <th>Grade</th>
                    <th>State</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {makeupRequests.map((request) => (
                    <tr key={request._id}>
                      <td>
                        {request.course.courseName} ({request.course.courseCode}
                        )
                      </td>
                      <td
                        style={{
                          color:
                            request.grade?.letterGrade === "FF"
                              ? "#ff4d4f"
                              : request.grade?.letterGrade === "DD"
                              ? "#faad14"
                              : request.grade?.letterGrade === "DC"
                              ? "#1890ff"
                              : request.grade?.letterGrade === "DZ"
                              ? "#ff4d4f"
                              : "#52c41a",
                        }}
                      >
                        {request.grade?.letterGrade}
                        {request.grade?.letterGrade === "DZ" && " (Failed)"}
                        <br />
                   
                      </td>
                      <td
                        style={{
                          color: getStatusColor(request.status),
                          fontWeight: "bold",
                        }}
                      >
                        {request.status === "pending" && "Pending"}
                        {request.status === "approved" && "Approved"}
                        {request.status === "rejected" && "Rejected"}
                      </td>
                      <td>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>You haven't sent any makeup exam requests yet</p>
          )}
        </div>
      )}

      {/* Ders Notları */}
      {data.courses.length > 0 && !showRequests && !showMessages && (
        <Grades data={data} getGradeColor={getGradeColor} />
      )}

      {/* Update Exams Section */}
      {showExams && (
        <div
          className="Exams"
          style={{
            width: "1112px",
            backgroundColor: "#ffffff",
            padding: "24px",
            marginTop: "24px",
            borderRadius: "12px",
            marginBottom: "24px",
            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          }}
        >
          <h2 style={{ marginBottom: "24px", color: "#333", fontSize: "28px" }}>
            My Exams
          </h2>

          {examsLoading ? (
            <p style={{ color: "#666" }}>Yükleniyor...</p>
          ) : exams.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "20px",
              }}
            >
              {exams.map((exam, index) => (
                <details
                  key={exam._id}
                  style={{
                    backgroundColor: "#f0f4f8",
                    borderRadius: "10px",
                    padding: "16px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",

                  }}
                >
                  <summary
                    style={{
                      fontWeight: "600",
                      fontSize: "18px",
                      color: "#2c3e50",
                      marginBottom: "10px",
                    }}
                  >
                    {exam.title}
                  </summary>
                  <div
   style={{
    color: "#34495e",
    fontSize: "15px",
    lineHeight: "1.6",
    transition: "all 2s ease",
  }}
  
                  >
                    <p>
                      <strong>Lesson:</strong> {exam.course.courseName} (
                      {exam.course.courseCode})
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(exam.date).toLocaleString()}
                    </p>
                    <p>
                      <strong>Time:</strong> {exam.duration} dakika
                    </p>
                    <p>
                      <strong>Place:</strong> {exam.location}
                    </p>
                    <p>
                      <strong>Type of Exam:</strong> {exam.type}
                    </p>
                    {exam.description && (
                      <p>
                        <strong>Explanation:</strong> {exam.description}
                      </p>
                    )}
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <p style={{ color: "#666" }}>No exams found yet.</p>
          )}
        </div>
      )}

      {/* Update My Courses Section */}
      {showMyCourses && (
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
          <h2>The Lessons I Took</h2>
          {myCourses && myCourses.length > 0 ? (
            <div style={{ display: "grid", gap: "15px" }}>
              {myCourses.map((course) => (
                <Card
                  key={course.course._id}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0 }}>{course.course.courseName}</h3>
                      <p style={{ margin: "5px 0", color: "#666" }}>
                        Harf Notu:{" "}
                        <span
                          style={{ color: getGradeColor(course.letterGrade) }}
                        >
                          {course.letterGrade || "NA"}
                          {course.letterGrade === "DZ" && (
                            <span style={{ color: "#ff4d4f", marginLeft: "5px" }}>
                              (Absent)
                            </span>
                          )}
                        </span>
                      </p>
                    </div>
                    <Button
                      type="primary"
                      icon={<InfoCircleOutlined />}
                      onClick={() => handleShowCourseDetails(course.course)}
                    >
                      Detaylar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                backgroundColor: "#f0f2f5",
                borderRadius: "8px",
              }}
            >
              <p>
                Henüz ders seçimi yapmadınız. Ders seçmek için sağ üstteki "Ders
                Seç" butonunu kullanabilirsiniz.
              </p>
              <Button
                type="primary"
                onClick={() => {
                  setIsTakeCoursesModalVisible(true);
                  fetchAvailableCourses();
                  fetchDepartmentInstructors();
                  setFilteredCourses([]);
                }}
                style={{ marginTop: "10px" }}
              >
                Ders Seç
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Course Details Modal */}
      <Modal
        title="Ders Detayları"
        visible={isCourseDetailsModalVisible}
        onCancel={() => setIsCourseDetailsModalVisible(false)}
        footer={null}
      >
        {selectedCourseDetails && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Ders Adı">
              {selectedCourseDetails.courseName}
            </Descriptions.Item>
            <Descriptions.Item label="Bölüm">
              {selectedCourseDetails.department}
            </Descriptions.Item>
            <Descriptions.Item label="Öğretim Üyesi">
              {selectedCourseDetails.instructor}
            </Descriptions.Item>
            {selectedCourseDetails.description && (
              <Descriptions.Item label="Açıklama">
                {selectedCourseDetails.description}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Take Courses Modal */}
      <Modal
        title="Ders Seçimi"
        open={isTakeCoursesModalVisible}
        onCancel={() => setIsTakeCoursesModalVisible(false)}
        onOk={handleCourseRegistration}
        confirmLoading={loading.availableCourses}
        width={800}
      >
        <div style={{ marginBottom: 24 }}>
          <h4>Bölüm Öğretim Üyeleri</h4>
          <Table
            dataSource={departmentInstructors}
            columns={[
              {
                title: "İsim",
                dataIndex: "name",
                key: "name",
                render: (text, record) => `${record.name} ${record.surname}`,
              },
              {
                title: "Email",
                dataIndex: "email",
                key: "email",
              },
              {
                title: "Uzmanlık",
                dataIndex: "expertise",
                key: "expertise",
              },
            ]}
            size="small"
            pagination={false}
            style={{ marginBottom: 24 }}
          />

          <h4 style={{ marginTop: 16 }}>Mevcut Dersler</h4>

          {/* Add department filter */}
          <div style={{ marginBottom: 16, display: "flex", gap: 10 }}>
            <Select
              placeholder="Bölüme göre filtrele"
              style={{ width: 200 }}
              allowClear
              onChange={(value) => {
                if (value) {
                  const filtered = availableCourses.filter(
                    (course) => course.department === value
                  );
                  setFilteredCourses(filtered);
                } else {
                  setFilteredCourses(availableCourses);
                }
              }}
            >
              {Array.from(
                new Set(availableCourses.map((course) => course.department))
              )
                .filter(Boolean)
                .map((dept) => (
                  <Option key={dept} value={dept}>
                    {dept}
                  </Option>
                ))}
            </Select>

            <Select
              placeholder="Öğretim üyesine göre filtrele"
              style={{ width: 200 }}
              allowClear
              onChange={(value) => {
                if (value) {
                  const filtered = availableCourses.filter((course) =>
                    course.instructorName?.includes(value)
                  );
                  setFilteredCourses(filtered);
                } else {
                  setFilteredCourses(availableCourses);
                }
              }}
            >
              {Array.from(
                new Set(availableCourses.map((course) => course.instructorName))
              )
                .filter(Boolean)
                .map((instructor) => (
                  <Option key={instructor} value={instructor}>
                    {instructor}
                  </Option>
                ))}
            </Select>
          </div>

          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Ders seçiniz"
            onChange={handleCourseSelection}
            loading={loading.availableCourses}
            value={selectedCourses}
            optionFilterProp="children"
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {(filteredCourses || availableCourses).map((course) => (
              <Option
                key={course._id}
                value={course._id}
                disabled={
                  selectedCourses.length >= 5 &&
                  !selectedCourses.includes(course._id)
                }
              >
                {course.courseName} ({course.courseCode || "No Code"}) -{" "}
                {course.department || "No Dept"} -{" "}
                {course.instructorName || "No Instructor"}
              </Option>
            ))}
          </Select>
          <div style={{ marginTop: 8, color: "#666" }}>
            Not: En fazla 5 ders seçebilirsiniz. Seçilen ders sayısı:{" "}
            {selectedCourses.length}
          </div>
        </div>
      </Modal>

      <div style={{ marginTop: "40px" }}>
        <Title level={2}>Student Panel</Title>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <Button
          type="primary"
          onClick={() => handleTypeFilter(null)}
          style={{
            background: selectedType === null && showAnnouncements 
              ? "linear-gradient(90deg, #1890ff 0%, #40a9ff 100%)"
              : "#f0f0f0",
            color: selectedType === null && showAnnouncements ? "#fff" : "#000",
            border: "none",
            boxShadow: selectedType === null && showAnnouncements 
              ? "0 2px 8px rgba(24,144,255,0.15)"
              : "none",
            fontWeight: 600,
            borderRadius: 8,
            transition: "all 0.3s ease",
          }}
        >
          All Announcements
        </Button>
        <Button
          type="primary"
          onClick={() => handleTypeFilter("normal")}
          style={{
            background: selectedType === "normal" && showAnnouncements 
              ? "linear-gradient(90deg, #1890ff 0%, #40a9ff 100%)"
              : "#f0f0f0",
            color: selectedType === "normal" && showAnnouncements ? "#fff" : "#000",
            border: "none",
            boxShadow: selectedType === "normal" && showAnnouncements 
              ? "0 2px 8px rgba(24,144,255,0.15)"
              : "none",
            fontWeight: 600,
            borderRadius: 8,
            transition: "all 0.3s ease",
          }}
        >
          Normal Announcements
        </Button>
        <Button
          type="primary"
          onClick={() => handleTypeFilter("finals")}
          style={{
            background: selectedType === "finals" && showAnnouncements 
              ? "linear-gradient(90deg, #1890ff 0%, #40a9ff 100%)"
              : "#f0f0f0",
            color: selectedType === "finals" && showAnnouncements ? "#fff" : "#000",
            border: "none",
            boxShadow: selectedType === "finals" && showAnnouncements 
              ? "0 2px 8px rgba(24,144,255,0.15)"
              : "none",
            fontWeight: 600,
            borderRadius: 8,
            transition: "all 0.3s ease",
          }}
        >
          Final Exam Announcements
        </Button>
        <Button
          type="primary"
          onClick={() => handleTypeFilter("makeup")}
          style={{
            background: selectedType === "makeup" && showAnnouncements 
              ? "linear-gradient(90deg, #1890ff 0%, #40a9ff 100%)"
              : "#f0f0f0",
            color: selectedType === "makeup" && showAnnouncements ? "#fff" : "#000",
            border: "none",
            boxShadow: selectedType === "makeup" && showAnnouncements 
              ? "0 2px 8px rgba(24,144,255,0.15)"
              : "none",
            fontWeight: 600,
            borderRadius: 8,
            transition: "all 0.3s ease",
          }}
        >
          Makeup Exam Announcements
        </Button>
      </div>

      {/* Duyurular sadece showAnnouncements true ise gösterilecek */}
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
                        <span style={{ 
                          fontSize: "16px", 
                          fontWeight: "bold",
                          color: "#333"
                        }}>
                          {announcement.title}
                        </span>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <span
                            style={{
                              fontSize: "14px",
                              padding: "4px 8px",
                              borderRadius: "30px 50px 30px 50px",
                              backgroundColor:
                                announcement.department &&
                                announcement.department !== "General"
                                  ? "#1890ff"
                                  : "#87d068",
                              color: "white",
                            }}
                          >
                            {announcement.department &&
                            announcement.department !== "General"
                              ? announcement.department
                              : "General Announcement for All Departments"}
                          </span>
                          <span
                            style={{
                              fontSize: "14px",
                              padding: "4px 8px",
                              borderRadius: "30px 50px 30px 50px",
                              backgroundColor:
                                announcement.type === "finals"
                                  ? "#ff4d4f"
                                  : announcement.type === "makeup"
                                  ? "#faad14"
                                  : "#52c41a",
                              color: "white",
                            }}
                          >
                            {announcement.type === "finals"
                              ? "Final Exam Announcement"
                              : announcement.type === "makeup"
                              ? "Makeup Exam Announcement"
                              : "Normal Announcement"}
                          </span>
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: "12px", 
                        color: "#666",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}>
                        <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  }
                  key="1"
                >
                  <div style={{ padding: "16px 0" }}>
                    <p style={{ 
                      marginBottom: "16px",
                      fontSize: "14px",
                      lineHeight: "1.6",
                      color: "#333"
                    }}>
                      {announcement.content}
                    </p>
                    <div style={{ 
                      marginTop: "16px", 
                      color: "#666", 
                      fontSize: "12px",
                      borderTop: "1px solid #f0f0f0",
                      paddingTop: "12px"
                    }}>
                      <p>
                        <strong>Department:</strong>{" "}
                        {announcement.department &&
                        announcement.department !== "General"
                          ? announcement.department
                          : "General Announcement for All Departments"}
                      </p>
                      <p>
                        <strong>Type:</strong>{" "}
                        {announcement.type === "finals"
                          ? "Final Exam Announcement"
                          : announcement.type === "makeup"
                          ? "Makeup Exam Announcement"
                          : "Normal Announcement"}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(announcement.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {announcement.files && announcement.files.length > 0 && (
                      <div
                        style={{
                          marginTop: "16px",
                          border: "1px solid #f0f0f0",
                          borderRadius: "4px",
                          padding: "12px",
                          backgroundColor: "#fafafa"
                        }}
                      >
                        <h4
                          style={{
                            marginTop: 0,
                            marginBottom: "12px",
                            borderBottom: "1px solid #f0f0f0",
                            paddingBottom: "8px",
                            fontSize: "14px",
                            color: "#333"
                          }}
                        >
                          Files ({announcement.files.length})
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          {announcement.files.map((file, index) => (
                            <div
                              key={index}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "8px",
                                backgroundColor: "#fff",
                                borderRadius: "4px",
                                border: "1px solid #eee",
                              }}
                            >
                              <div style={{ marginRight: "10px" }}>
                                {getFileIcon(file.originalname || file.name)}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: "500" }}>
                                  {file.originalname || file.name}
                                </div>
                                <div style={{ fontSize: "12px", color: "#888" }}>
                                  {file.size
                                    ? `${(file.size / 1024).toFixed(2)} KB`
                                    : ""}
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: "8px" }}>
                                {isViewable(file.originalname || file.name) && (
                                  <Button
                                    type="text"
                                    icon={<EyeOutlined />}
                                    onClick={() => window.open(getViewUrl(file))}
                                  />
                                )}
                                <Button
                                  type="text"
                                  icon={<DownloadOutlined />}
                                  onClick={() => handleDownload(file)}
                                />
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
    </div>
  );
};

export default Dashboard;
