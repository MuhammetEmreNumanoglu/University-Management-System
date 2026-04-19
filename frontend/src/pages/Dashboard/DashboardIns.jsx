import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Courses from "../../component/Courses";
import {
  Modal,
  Button,
  Form,
  InputNumber,
  message,
  Select,
  Input,
  Card,
  Space,
  Typography,
  Upload,
  DatePicker,
  Spin,
  Collapse,
} from "antd";
import "./Dashboard.css"; // Yeni CSS dosyası
import InstructorNotificationDropdown from "../../component/InstructorNotificationDropdown";
import { UploadOutlined } from "@ant-design/icons";
import moment from "moment";
import {
  FileOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileZipOutlined,
  FileTextOutlined,
  EyeOutlined,
  DownloadOutlined,
  DownOutlined,
  UserOutlined,
  BankOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { saveAs } from "file-saver";

const { Title, Text } = Typography;
const { TextArea } = Input;

const DashboardIns = () => {
  const navigate = useNavigate();

  // Bölümler listesi
  const departments = [
    "Computer Engineering",
    "Software Engineering",
    "Chemical Engineering",
  ];

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [grades, setGrades] = useState({});
  const [gradesLoading, setGradesLoading] = useState({});
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [showApprovedRequests, setShowApprovedRequests] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [isAddGradeModalVisible, setIsAddGradeModalVisible] = useState(false);
  const [isCourseModalVisible, setIsCourseModalVisible] = useState(false);
  const [isAnnouncementModalVisible, setIsAnnouncementModalVisible] =
    useState(false);
  const [fileList, setFileList] = useState([]);
  const [announcementForm] = Form.useForm();
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [form] = Form.useForm();
  const [courseForm] = Form.useForm();
  const [notifications, setNotifications] = useState([]);
  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [showExams, setShowExams] = useState(false);
  const [isExamEditModalVisible, setIsExamEditModalVisible] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examForm] = Form.useForm();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showMessages, setShowMessages] = useState(false);
  const [conversations, setConversations] = useState({});
  const [activeConversation, setActiveConversation] = useState(null);
  const messagesEndRef = useRef(null);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [hiddenAnnouncements, setHiddenAnnouncements] = useState([]);
  const [showNotes, setShowNotes] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);
  const [showMakeupRequests, setShowMakeupRequests] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [showGrades, setShowGrades] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [isAddGradeFileModalVisible, setIsAddGradeFileModalVisible] =
    useState(false);
  const [gradeFileList, setGradeFileList] = useState([]);
  const [selectedCourseForGrades, setSelectedCourseForGrades] = useState(null);
  const [activeButton, setActiveButton] = useState(null);
  const [searchStudentNumber, setSearchStudentNumber] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get(
          "/api/instructor/notifications"
        );
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    // Initial fetch
    fetchNotifications();

    // Set up polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchInstructorInfo = async () => {
      try {
        const response = await axiosInstance.get("/api/get/ins/getMy");
        setData(response.data);
        setLoading(false);
      } catch (e) {
        console.error("Error fetching instructor info:", e);
        setError("Error loading instructor information");
        setLoading(false);
      }
    };

    fetchInstructorInfo();
  }, []);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setExamsLoading(true);
        const response = await axiosInstance.get("/api/exam/instructor");
        setExams(response.data);
      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setExamsLoading(false);
      }
    };

    fetchExams();
  }, []);

  useEffect(() => {
    // Gizli duyuruları local storage'dan al
    const savedHiddenAnnouncements = localStorage.getItem(
      "hiddenAnnouncementsIns"
    );
    if (savedHiddenAnnouncements) {
      setHiddenAnnouncements(JSON.parse(savedHiddenAnnouncements));
    }
  }, []);

  useEffect(() => {
    // Sadece duyuruları getir, gösterme
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    // Eğer showAnnouncements false ise hiçbir şey gösterme
    if (!showAnnouncements) {
      setFilteredAnnouncements([]);
      return;
    }

    // Duyuruları filtrele
    let filtered = announcements.filter(
      (announcement) => !hiddenAnnouncements.includes(announcement._id)
    );

    // Eğer bir tür seçili ise o türe göre filtrele
    if (selectedType) {
      filtered = filtered.filter(
        (announcement) => announcement.type === selectedType
      );
    }

    // Tarihe göre sırala (en yeni en üstte)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredAnnouncements(filtered);
  }, [announcements, selectedType, hiddenAnnouncements, showAnnouncements]);

  const fetchAnnouncements = async () => {
    try {
      const response = await axiosInstance.get("/api/announcement");
      setAnnouncements(response.data);
      // Duyuruları getirdikten sonra filteredAnnouncements'ı boş bırak
      setFilteredAnnouncements([]);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      message.error("Duyurular yüklenirken hata oluştu");
    }
  };

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

  const handleShowExams = () => {
    setShowExams(!showExams);

    // If showing exams, hide other sections
    if (!showExams) {
      setShowApprovedRequests(false);
      setShowMessages(false);
    }
  };

  const fetchMessages = async (studentId) => {
    try {
      if (!data?._id) {
        message.error("Eğitmen bilgileri yüklenmedi");
        return;
      }

      const response = await axiosInstance.get(
        `/api/messages/${studentId}/${data._id}`
      );

      setMessages(response.data);
      setActiveConversation(studentId);

      setConversations((prev) => ({
        ...prev,
        [studentId]: response.data,
      }));

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Mesaj yükleme hatası:", error);
      message.error("Mesajlar yüklenemedi");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!data?._id) {
      message.error("Eğitmen bilgileri yüklenmedi");
      return;
    }

    if (!newMessage.trim()) {
      message.error("Mesaj boş olamaz");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("senderId", data._id);
      formData.append("receiverId", activeConversation);
      formData.append("content", newMessage);
      formData.append("senderModel", "Instructor");
      formData.append("receiverModel", "Student");
      console.log(data._id);

      const response = await axiosInstance.post("/api/messages", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setNewMessage("");
      await fetchMessages(activeConversation);
      message.success("Mesaj gönderildi");
    } catch (error) {
      console.error("Mesaj gönderme hatası:", error);
      message.error(error.response?.data?.error || "Mesaj gönderilemedi");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleMessages = async () => {
    if (!showMessages) {
      await fetchStudents();
    }
    setShowMessages(!showMessages);
  };

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      const response = await axiosInstance.get("/api/student");
      setStudents(response.data);
    } catch (e) {
      console.error("Öğrenciler yüklenirken hata:", e);
      message.error("Öğrenciler yüklenirken hata oluştu");
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchMyCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await axiosInstance.get("/api/getMy/course");
      console.log("Instructor courses:", response.data);
      setCourses(response.data);
    } catch (e) {
      console.error("Dersler yüklenirken hata:", e);
      setError("Dersler yüklenirken hata oluştu");
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchStudentGrades = async (courseId) => {
    try {
      setGradesLoading((prev) => ({ ...prev, [courseId]: true }));
      console.log("Notlar yükleniyor, ders ID:", courseId);
      
      const response = await axiosInstance.get(`/api/ins/getMy/students?courseId=${courseId}`);
      console.log("Sunucudan gelen notlar:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Notları güncelle ve logla
        const updatedGrades = response.data.map(student => ({
          ...student,
          letterGrade: student.letterGrade || 'Not Girilmedi'
        }));
        
        setGrades((prev) => ({ ...prev, [courseId]: updatedGrades }));
        console.log("Güncellenmiş notlar:", updatedGrades);
      } else {
        console.error("Geçersiz veri formatı:", response.data);
        message.error("Notlar yüklenirken bir hata oluştu: Geçersiz veri formatı");
      }
    } catch (error) {
      console.error("Notlar yüklenirken hata:", error);
      message.error(error.response?.data?.message || "Notlar yüklenirken bir hata oluştu");
    } finally {
      setGradesLoading((prev) => ({ ...prev, [courseId]: false }));
    }
  };

  const fetchApprovedRequests = async () => {
    try {
      setRequestsLoading(true);
      const response = await axiosInstance.get(
        "/api/instructor/makeup-requests/approved"
      );
      setApprovedRequests(response.data);
      setShowApprovedRequests(true);

      // Hide other sections
      setShowMessages(false);
    } catch (e) {
      console.error("Approved requests error:", e);
      setError("Onaylanan istekler yüklenirken hata oluştu");
    } finally {
      setRequestsLoading(false);
    }
  };

  const showAddGradeModal = () => {
    fetchMyCourses();
    setIsAddGradeModalVisible(true);
  };

  const handleAddGradeCancel = () => {
    setIsAddGradeModalVisible(false);
    form.resetFields();
  };

  const showCourseModal = () => {
    setIsCourseModalVisible(true);
  };

  const handleCourseCancel = () => {
    setIsCourseModalVisible(false);
    courseForm.resetFields();
  };

  const handleAddGradeSubmit = async (values) => {
    try {
      const response = await axiosInstance.post("/api/grade/create", {
        studentNumber: values.studentNumber,
        letterGrade: values.letterGrade,
        courseId: values.courseId,
      });

      message.success(response.data.message);
      setIsAddGradeModalVisible(false);
      form.resetFields();

      if (values.courseId) {
        await fetchStudentGrades(values.courseId);
      }
    } catch (error) {
      console.error("Not ekleme hatası:", error);
      message.error(
        error.response?.data?.message || "Not eklenirken hata oluştu"
      );
    }
  };

  const handleCourseSubmit = async (values) => {
    try {
      const response = await axiosInstance.post("/api/course/create", {
        courseName: values.courseName,
        department: values.department,
      });

      message.success(response.data.message);
      setIsCourseModalVisible(false);
      courseForm.resetFields();
      fetchMyCourses();
    } catch (error) {
      console.error("Ders oluşturma hatası:", error);
      message.error(
        error.response?.data?.message || "Ders oluşturulurken hata oluştu"
      );
    }
  };

  const handleUpdateGrade = async (gradeId, { letterGrade }) => {
    try {
      const response = await axiosInstance.put(`/api/grade/update/${gradeId}`, {
        letterGrade,
      });
      
      if (response.data.success) {
        message.success("Not başarıyla güncellendi");
      }
    } catch (error) {
      console.error("Not güncelleme hatası:", error);
      message.error(error.response?.data?.message || "Not güncellenirken hata oluştu");
      throw error;
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      await axiosInstance.put(`/api/instructor/makeup-requests/${requestId}`, {
        status: action,
      });

      fetchApprovedRequests();
      fetchMyCourses();
    } catch (e) {
      console.error("Update request error:", e);
      setError("İşlem sırasında hata oluştu");
    }
  };
  const navigateToAnnouncements = () => {
    navigate("/announcement");
  };

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  const showAnnouncementModal = () => {
    setIsAnnouncementModalVisible(true);
  };

  const handleAnnouncementCancel = () => {
    setIsAnnouncementModalVisible(false);
    announcementForm.resetFields();
    setFileList([]);
  };

  const handleAnnouncementSubmit = async (values) => {
    try {
      console.log("Form values:", values); // Debug log for form values

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("content", values.content);
      formData.append("department", values.department);
      formData.append("type", values.type);

      console.log("Selected type:", values.type); // Debug log for type

      if (fileList.length > 0) {
        fileList.forEach((file) => {
          formData.append("files", file.originFileObj);
        });
      }

      // Log the FormData entries
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
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

      console.log("Response:", response.data); // Debug log for response

      message.success("Duyuru başarıyla oluşturuldu");
      setIsAnnouncementModalVisible(false);
      announcementForm.resetFields();
      setFileList([]);
      await fetchAnnouncements();
    } catch (error) {
      console.error("Duyuru oluşturma hatası:", error);
      message.error(error.response?.data?.message || "Duyuru oluşturulamadı");
    }
  };

  const handleExamEdit = (exam) => {
    setSelectedExam(exam);
    examForm.setFieldsValue({
      title: exam.title,
      date: moment(exam.date),
      duration: exam.duration,
      location: exam.location,
      description: exam.description,
      type: exam.type,
    });
    setIsExamEditModalVisible(true);
  };

  const handleExamEditSubmit = async (values) => {
    try {
      const response = await axiosInstance.put(
        `/api/exam/update/${selectedExam._id}`,
        {
          ...values,
          date: values.date.toISOString(),
        }
      );

      message.success("Sınav başarıyla güncellendi");
      setIsExamEditModalVisible(false);
      examForm.resetFields();
      setSelectedExam(null);

      // Refresh exams list
      const updatedExams = await axiosInstance.get("/api/exam/instructor");
      setExams(updatedExams.data);
    } catch (error) {
      console.error("Error updating exam:", error);
      message.error(
        error.response?.data?.message || "Sınav güncellenirken hata oluştu"
      );
    }
  };

  // Duyuru gizleme fonksiyonu ekle
  const hideAnnouncement = (announcementId) => {
    const updatedHiddenAnnouncements = [...hiddenAnnouncements, announcementId];
    setHiddenAnnouncements(updatedHiddenAnnouncements);

    // Local storage'a kaydet
    localStorage.setItem(
      "hiddenAnnouncementsIns",
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

    // Eğer path varsa, doğru filename'i çıkar
    if (file.path) {
      // Path'den sadece dosya adını al, "uploads/" önekini kaldır
      const pathParts = file.path.split("/");
      const filename = pathParts[pathParts.length - 1];
      return `/api/files/${filename}?originalname=${encodeURIComponent(
        file.originalname || file.name
      )}`;
    }

    // Eğer sadece filename varsa
    if (file.filename) {
      return `/api/files/${file.filename}?originalname=${encodeURIComponent(
        file.originalname || file.name
      )}`;
    }

    // Başka bir durum olursa
    return file.url || "";
  };

  // Dosya tipine göre görüntüleme URL'i oluştur
  const getViewUrl = (file) => {
    // Resim dosyaları için doğrudan uploads klasörüne yönlendir
    const extension = (file.originalname || file.name || "")
      .split(".")
      .pop()
      .toLowerCase();
    const isImage = ["jpg", "jpeg", "png", "gif", "bmp"].includes(extension);

    if (isImage) {
      // Path'den sadece dosya adını al veya filename'i kullan
      let filename;
      if (file.path) {
        const pathParts = file.path.split("/");
        filename = pathParts[pathParts.length - 1];
      } else {
        filename = file.filename;
      }

      if (filename) {
        return `/uploads/${filename}`;
      }
    }

    // Diğer görüntülenebilir dosyalar için api endpoint'i kullan
    return getFileUrl(file);
  };

  // handleDownload fonksiyonunu ekle
  const handleDownload = async (file) => {
    try {
      // Dosya filename kullanarak indirme
      if (file.filename) {
        const response = await axiosInstance.get(
          `/api/files/${file.filename}`,
          {
            responseType: "blob",
          }
        );
        saveAs(new Blob([response.data]), file.originalname || file.name);
        return;
      }

      // Eğer path varsa path'den filename çıkarma
      if (file.path) {
        const pathParts = file.path.split("/");
        const filename = pathParts[pathParts.length - 1];
        const response = await axiosInstance.get(`/api/files/${filename}`, {
          responseType: "blob",
        });
        saveAs(new Blob([response.data]), file.originalname || file.name);
        return;
      }

      // URL varsa direkt URL ile indirme
      if (file.url) {
        window.open(file.url, "_blank");
      }
    } catch (err) {
      console.error("Dosya indirme hatası:", err);
      message.error("Dosya indirilirken hata oluştu");
    }
  };

  // Dosya ile Not Ekleme Modalı
  const showAddGradeFileModal = () => {
    // Önce dersleri yükle
    fetchMyCourses();
    setIsAddGradeFileModalVisible(true);
  };

  // Seçilen kurs için not şablonu indir
  const handleDownloadGradeTemplate = async () => {
    if (!selectedCourseForGrades) {
      message.error("Lütfen bir ders seçin!");
      return;
    }

    console.log("Downloading template for course ID:", selectedCourseForGrades);

    try {
      // Use fetch API directly for consistent approach
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/grade/template/${selectedCourseForGrades}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error downloading template:", errorData);
        throw new Error(errorData.message || "Not şablonu indirilemedi");
      }

      const blob = await response.blob();

      // Kursa göre dosya adı oluştur
      const course = courses.find((c) => c._id === selectedCourseForGrades);
      const fileName = `${course?.courseCode || "ders"}_not_sablonu.xlsx`;

      // Dosyayı indir
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      message.success("Not şablonu indirildi");
    } catch (error) {
      console.error("Error downloading grade template:", error);
      message.error(error.message || "Not şablonu indirilemedi");
    }
  };

  // Dosya ile not ekleme fonksiyonu
  const handleAddGradeFileSubmit = async () => {
    try {
      if (!gradeFileList || gradeFileList.length === 0) {
        message.error("Lütfen bir dosya seçin!");
        return;
      }

      if (!selectedCourseForGrades) {
        message.error("Lütfen bir ders seçin!");
        return;
      }

      const fileObj = gradeFileList[0];
      if (!fileObj || !fileObj.originFileObj) {
        message.error("Geçersiz dosya formatı!");
        return;
      }

      const file = fileObj.originFileObj;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("courseId", selectedCourseForGrades);

      // Yükleme başladı mesajı
      const response = await axiosInstance.post("/api/grade/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Yükleme ilerlemesi: ${percentCompleted}%`);
        },
      });

      if (response.data.success) {
        message.success("Notlar başarıyla yüklendi");
        setIsAddGradeFileModalVisible(false);
        setGradeFileList([]);
        setSelectedCourseForGrades(null);
        
        // Notları yenile
        await fetchMyCourses();
        if (selectedCourseForGrades) {
          await fetchStudentGrades(selectedCourseForGrades);
        }
      } else {
        message.error(response.data.message || "Notlar yüklenirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Dosya yükleme hatası:", error);
      message.error(error.response?.data?.message || "Dosya yüklenirken bir hata oluştu");
    }
  };

  // Test file upload function for debugging
  const testFileUpload = async () => {
    if (!gradeFileList || gradeFileList.length === 0) {
      message.error("Lütfen bir dosya seçin!");
      return;
    }

    // Check if we have a valid file object
    const fileObj = gradeFileList[0];
    if (!fileObj || !fileObj.originFileObj) {
      console.error("Invalid file object:", fileObj);
      message.error("Dosya yüklenirken hata oluştu: Geçersiz dosya");
      return;
    }

    // Get the file object
    const file = fileObj.originFileObj;
    console.log("Test upload - File:", file);
    console.log("Test upload - File name:", file.name);
    console.log("Test upload - File type:", file.type);
    console.log("Test upload - File size:", file.size, "bytes");

    const formData = new FormData();
    formData.append("file", file);

    // Log FormData contents
    for (let pair of formData.entries()) {
      console.log(`Test upload - FormData contains: ${pair[0]}, ${pair[1]}`);
    }

    try {
      const response = await fetch("http://localhost:3000/api/test-upload", {
        method: "POST",
        body: formData,
      });

      console.log("Test upload - Response status:", response.status);
      const data = await response.json();
      console.log("Test upload - Response data:", data);

      if (response.ok) {
        message.success("Test upload successful!");
      } else {
        message.error(data.message || "Test upload failed");
      }
    } catch (error) {
      console.error("Test upload error:", error);
      message.error("Test upload failed");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red", textAlign: "center" }}>
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Instructor information not found
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: { bg: "#FFC107", text: "Pending" },
      approved: { bg: "#4CAF50", text: "Approved" },
      rejected: { bg: "#F44336", text: "Rejected" },
    };

    return (
      <span
        style={{
          backgroundColor: statusColors[status].bg,
          color: "white",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "0.8rem",
        }}
      >
        {statusColors[status].text}
      </span>
    );
  };

  const renderRequestsTable = () => {
    if (requestsLoading) {
      return (
        <div style={{ textAlign: "center", padding: "20px" }}>
          Yükleniyor...
        </div>
      );
    }

    if (approvedRequests.length === 0) {
      return <p>Onaylanan istek bulunmamaktadır.</p>;
    }

    // Arama filtresini uygula
    const filteredRequests = approvedRequests.filter(request => {
      const studentNumber = String(request.student?.studentNumber || '');
      return studentNumber.toLowerCase().includes(searchStudentNumber.toLowerCase());
    });

    return (
      <div style={{ 
        overflowX: "auto",
        backgroundColor: "white",
        borderRadius: "15px",
        padding: "20px",
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{ marginBottom: "20px" }}>
          <Input.Search
            placeholder="Öğrenci numarasına göre ara..."
            allowClear
            value={searchStudentNumber}
            onChange={(e) => setSearchStudentNumber(e.target.value)}
            style={{ width: "300px" }}
          />
        </div>
        <div style={{ 
          maxHeight: "600px", // 3 satır için yaklaşık yükseklik
          overflowY: "auto",
          border: "1px solid #f0f0f0",
          height:"310px",
          borderRadius: "8px"
        }}>
          <table className="requests-table">
            <thead style={{ position: "sticky", top: 0, backgroundColor: "white", zIndex: 1 }}>
              <tr>
                <th>Student</th>
                <th>Lesson</th>
                <th>Grade</th>
                <th>Explanation</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request._id}>
                  <td>
                    {request.student?.name} {request.student?.surname}
                    <br />({request.student?.studentNumber})
                  </td>
                  <td>
                    {request.course?.courseName}
                    <br />({request.course?.courseCode})
                  </td>
                  <td style={{
                    color: request.grade?.letterGrade === "FF" ? "#ff4d4f" :
                           request.grade?.letterGrade === "DD" ? "#faad14" :
                           request.grade?.letterGrade === "DC" ? "#1890ff" : "#52c41a"
                  }}>
                    {request.grade?.letterGrade}
                    <br />
                  </td>
                  <td>{request.text || "Açıklama yok"}</td>
                  <td style={{
                    color: "#4CAF50",
                    fontWeight: "bold"
                  }}>
                    Approved
                    {request.autoApproved && " (Otomatik)"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container" style={{ fontFamily: "'Playfair Display', serif" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Title level={2}>Instructor Dashboard</Title>
        <Space>
          <InstructorNotificationDropdown />
          <Button type="primary" onClick={showAnnouncementModal}>
            New Announcement
          </Button>
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
        title="Instructor Information" 
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
                <div style={{ fontSize: "16px", fontWeight: "500" }}>{data.name}</div>
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
                <div style={{ fontSize: "16px", fontWeight: "500" }}>{data.surname}</div>
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
                <div style={{ fontSize: "16px", fontWeight: "500" }}>{data.department}</div>
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
                <div style={{ fontSize: "16px", fontWeight: "500" }}>{data.email}</div>
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
          onClick={() => {
            if (activeButton === 'courses') {
              setActiveButton(null);
              setShowCourses(false);
            } else {
              setActiveButton('courses');
              setShowCourses(true);
              fetchMyCourses();
              setShowGrades(false);
              setShowMakeupRequests(false);
              setShowExams(false);
              setShowAnnouncements(false);
              setShowApprovedRequests(false);
            }
          }}
          className={`control-button ${activeButton === 'courses' ? "active" : ""}`}
        >
          My Courses
        </button>

        <button
          onClick={() => {
            if (activeButton === 'makeup') {
              setActiveButton(null);
              setShowMakeupRequests(false);
            } else {
              setActiveButton('makeup');
              setShowMakeupRequests(true);
              fetchApprovedRequests();
              setShowCourses(false);
              setShowGrades(false);
              setShowExams(false);
              setShowAnnouncements(false);
            }
          }}
          className={`control-button ${activeButton === 'makeup' ? "active" : ""}`}
        >
          Makeup Requests
        </button>

        <button
          onClick={() => {
            if (activeButton === 'exams') {
              setActiveButton(null);
              setShowExams(false);
            } else {
              setActiveButton('exams');
              setShowExams(true);
              setShowCourses(false);
              setShowGrades(false);
              setShowMakeupRequests(false);
              setShowApprovedRequests(false);
              setShowAnnouncements(false);
            }
          }}
          className={`control-button ${activeButton === 'exams' ? "active" : ""}`}
        >
          My Exams
        </button>

        <button
          onClick={() => {
            if (activeButton === 'addGrade') {
              setActiveButton(null);
              setIsAddGradeFileModalVisible(false);
            } else {
              setActiveButton('addGrade');
              showAddGradeFileModal();
              setShowCourses(false);
              setShowGrades(false);
              setShowMakeupRequests(false);
              setShowExams(false);
              setShowAnnouncements(false);
              setShowApprovedRequests(false);
            }
          }}
          className={`control-button ${activeButton === 'addGrade' ? "active" : ""}`}
          style={{
            color: "white",
            fontWeight: "bold",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          Add Grade with File
        </button>
      </div>

      {/* Dersler Bölümü */}
      {showCourses && (
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
            marginTop: "30px",
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
            <h2 style={{ marginTop: 0, color: "#333" }}>My Courses</h2>
          </div>

          {courses.length > 0 && (
            <Courses
              courses={courses}
              grades={grades}
              gradesLoading={gradesLoading}
              fetchStudentGrades={fetchStudentGrades}
              onUpdateGrade={handleUpdateGrade}
            />
          )}
        </div>
      )}

      {/* Bütünleme İstekleri Bölümü */}
      {showMakeupRequests && (
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
            marginTop: "30px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ marginTop: 0, color: "#333" }}>Approved Requests</h2>
          </div>

          {renderRequestsTable()}
        </div>
      )}

      {/* Sınavlar Bölümü */}
      {showExams && (
        <div
          className="Exams"
          style={{
            width: "1112px",
            backgroundColor: "#ffffff",
            padding: "24px",
            borderRadius: "12px",
            marginBottom: "24px",
            marginTop: "30px",
            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          }}
        >
          <h2 style={{ marginBottom: "24px", color: "#333", fontSize: "28px" }}>
            My Exams
          </h2>

          {examsLoading ? (
            <p style={{ color: "#666" }}>Loading...</p>
          ) : exams.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "20px",
              }}
            >
              {exams.map((exam) => (
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
                  <div style={{ color: "#34495e", fontSize: "15px", lineHeight: "1.6" }}>
                    <p>
                      <strong>Lesson:</strong> {exam.course?.courseName} (
                      {exam.course?.courseCode})
                    </p>
                    <p>
                      <strong>Date:</strong> {new Date(exam.date).toLocaleString()}
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
                    <p>
                      <strong>The Creator:</strong> {exam.createdBy?.name || "Bilinmiyor"}
                    </p>
                    {exam.editedBy && (
                      <p>
                        <strong>The Last Editor:</strong> {exam.editedBy?.name || "Bilinmiyor"} (
                        {new Date(exam.lastEditedAt).toLocaleString()})
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

      <div style={{ marginBottom: "24px", marginTop:"40px"}}>
        <Title level={2}>Instructor Panel</Title>
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
    Normal Notifications
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
    Finals Notifications
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
    Makeup Notifications
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
                              : "All Departments"}
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
                              ? "Final Notification"
                              : announcement.type === "makeup"
                              ? "Makeup Notification"
                              : "Normal Notification"}
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
                          ? "Final Notification"
                          : announcement.type === "makeup"
                          ? "Makeup Notification"
                          : "Normal Notification"}
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
                          Attached Files ({announcement.files.length})
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

      {/* Duyuru yoksa ve showAnnouncements true ise mesaj göster */}
      {showAnnouncements && filteredAnnouncements.length === 0 && (
        <Card  title="Announcements" style={{ marginBottom: "24px" }}>
          <p>No announcements found yet.</p>
        </Card>
      )}

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
            // ÖĞRENCİ LİSTELEME BÖLÜMÜ
            <div>
              <h3 style={{ marginBottom: "15px" }}>
                Select a student to start messaging
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: "10px",
                }}
              >
                {students.map((student) => (
                  <div
                    key={student._id}
                    onClick={() => {
                      setActiveConversation(student._id);
                      fetchMessages(student._id);
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
                        alignItems: "center",
                      }}
                    >
                      <span>
                        {student.name} {student.surname} (
                        {student.studentNumber})
                      </span>
                      {conversations[student._id]?.length > 0 && (
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
                          {conversations[student._id].length}
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
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  ← Geri Dön
                </button>
                <h3 style={{ margin: 0 }}>
                  {students.find((s) => s._id === activeConversation)?.name}{" "}
                  {students.find((s) => s._id === activeConversation)?.surname}{" "}
                  (
                  {
                    students.find((s) => s._id === activeConversation)
                      ?.studentNumber
                  }
                  )
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
                        padding: "12px",
                        marginBottom: "10px",
                        borderRadius: "12px",
                        backgroundColor:
                          msg.senderModel === "Instructor"
                            ? "#e6f7ff"
                            : "#f5f5f5",
                        marginLeft:
                          msg.senderModel === "Instructor" ? "auto" : "0",
                        border: "1px solid #e8e8e8",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "bold",
                          marginBottom: "5px",
                          color:
                            msg.senderModel === "Instructor"
                              ? "#1890ff"
                              : "#333",
                        }}
                      >
                        {msg.senderModel === "Instructor"
                          ? "Siz"
                          : `${
                              students.find((s) => s._id === msg.senderId)?.name
                            } ${
                              students.find((s) => s._id === msg.senderId)
                                ?.surname
                            }`}
                      </div>
                      <p style={{ margin: 0, wordBreak: "break-word" }}>
                        {msg.message}
                      </p>
                      {msg.fileUrl && (
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-block",
                            marginTop: "5px",
                            color: "#1890ff",
                            textDecoration: "none",
                          }}
                        >
                          📎 Ekli Dosya
                        </a>
                      )}
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "#666",
                          textAlign: "right",
                          marginTop: "5px",
                        }}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#666",
                      padding: "20px",
                    }}
                  >
                    <p>No messages yet</p>
                    <p>Start the conversation by sending the first message</p>
                  </div>
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
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    padding: "12px 15px",
                    border: "1px solid #ddd",
                    borderRadius: "20px",
                    outline: "none",
                    fontSize: "14px",
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
                    fontWeight: "500",
                    transition: "background-color 0.3s",
                    ":hover": {
                      backgroundColor: "#40a9ff",
                    },
                    ":disabled": {
                      backgroundColor: "#d9d9d9",
                      cursor: "not-allowed",
                    },
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

      {/* Notlar Bölümü */}
      {showGrades && (
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ marginTop: 0, color: "#333" }}>Course Grades</h2>
          {courses.length > 0 && (
            <Courses
              courses={courses}
              grades={grades}
              gradesLoading={gradesLoading}
              fetchStudentGrades={fetchStudentGrades}
              onUpdateGrade={handleUpdateGrade}
              showOnlyGrades={true}
            />
          )}
        </div>
      )}

      {/* Not Ekleme Modalı */}
      <Modal
        title="Add New Grade"
        visible={isAddGradeModalVisible}
        onCancel={handleAddGradeCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddGradeSubmit}>
          <Form.Item
            name="studentNumber"
            label="Student Number"
            rules={[{ required: true, message: "Student number is required" }]}
          >
            <Select
              showSearch
              placeholder="Select student"
              optionFilterProp="children"
              loading={studentsLoading}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {students.map((student) => (
                <Select.Option
                  key={student.studentNumber}
                  value={student.studentNumber}
                >
                  {student.studentNumber} - {student.name} {student.surname}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="courseId"
            label="Course"
            rules={[{ required: true, message: "Course selection is required" }]}
          >
            <Select placeholder="Select course">
              {courses.map((course) => (
                <Select.Option key={course._id} value={course._id}>
                  {course.courseName} ({course.courseCode})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="letterGrade"
            label="Letter Grade"
            rules={[{ required: true, message: "Letter grade is required" }]}
          >
            <Select placeholder="Select letter grade">
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
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ marginRight: "10px" }}
            >
              Save
            </Button>
            <Button onClick={handleAddGradeCancel}>Cancel</Button>
          </Form.Item>
        </Form>
      </Modal>
      {/* Ders Oluşturma Modalı */}
      <Modal
        title="Create New Course"
        visible={isCourseModalVisible}
        onCancel={handleCourseCancel}
        footer={null}
      >
        <Form form={courseForm} layout="vertical" onFinish={handleCourseSubmit}>
          <Form.Item
            name="courseName"
            label="Course Name"
            rules={[{ required: true, message: "Course name is required" }]}
          >
            <Input placeholder="Enter course name" />
          </Form.Item>

          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: "Department information is required" }]}
          >
            <Select placeholder="Select department">
              {departments.map((dept) => (
                <Select.Option key={dept} value={dept}>
                  {dept}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ marginRight: "10px" }}
            >
              Create
            </Button>
            <Button onClick={handleCourseCancel}>Cancel</Button>
          </Form.Item>
        </Form>
      </Modal>
      {/* Announcement Creation Modal */}
      <Modal
        title="Create New Announcement"
        visible={isAnnouncementModalVisible}
        onCancel={handleAnnouncementCancel}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={announcementForm}
          layout="vertical"
          onFinish={handleAnnouncementSubmit}
          initialValues={{ type: "normal" }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter a title!" }]}
          >
            <Input placeholder="Enter announcement title" />
          </Form.Item>

          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: "Please select a department!" }]}
          >
            <Select placeholder="Select department">
              {departments.map((dept) => (
                <Select.Option key={dept} value={dept}>
                  {dept}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="type"
            label="Announcement Type"
            rules={[
              { required: true, message: "Please select an announcement type!" },
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
            <TextArea rows={6} placeholder="Enter announcement content..." />
          </Form.Item>

          <Form.Item label="Upload File (Max. 10MB)">
            <Upload
              multiple
              fileList={fileList}
              beforeUpload={(file) => {
                const isLt10M = file.size / 1024 / 1024 < 10;
                if (!isLt10M) {
                  message.error("File size cannot exceed 10MB!");
                  return false;
                }
                return false;
              }}
              onChange={({ fileList }) => setFileList(fileList)}
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <Button onClick={handleAnnouncementCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Publish
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
      {/* Add Exam Edit Modal */}
      <Modal
        title="Edit Exam"
        visible={isExamEditModalVisible}
        onCancel={() => {
          setIsExamEditModalVisible(false);
          examForm.resetFields();
          setSelectedExam(null);
        }}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form form={examForm} layout="vertical" onFinish={handleExamEditSubmit}>
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
            label="Duration (Minutes)"
            rules={[
              { required: true, message: "Please enter exam duration!" },
            ]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[
              { required: true, message: "Please enter exam location!" },
            ]}
          >
            <Input placeholder="Enter exam location" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={4} placeholder="Enter exam description" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Exam Type"
            rules={[
              { required: true, message: "Please select exam type!" },
            ]}
          >
            <Select placeholder="Select exam type">
              <Select.Option value="oral">Oral</Select.Option>
              <Select.Option value="written">Written</Select.Option>
              <Select.Option value="classical">Classical</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <Button
                onClick={() => {
                  setIsExamEditModalVisible(false);
                  examForm.resetFields();
                  setSelectedExam(null);
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
      {/* Dosya ile Not Ekleme Modalı */}
      <Modal
        title="Add Grade with File"
        visible={isAddGradeFileModalVisible}
        onCancel={() => {
          setIsAddGradeFileModalVisible(false);
          setGradeFileList([]);
          setSelectedCourseForGrades(null);
        }}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item
            label="Select Course"
            required
            help="First select a course to download the template, fill in the grades and upload"
          >
            {coursesLoading ? (
              <Spin size="small" />
            ) : courses.length === 0 ? (
              <div>
                <p style={{ color: "red" }}>
                  No courses found yet. Please add a course first.
                </p>
                <Button
                  onClick={showCourseModal}
                  type="primary"
                  style={{ marginTop: 8 }}
                >
                  Add Course
                </Button>
              </div>
            ) : (
              <Select
                placeholder="Select course"
                value={selectedCourseForGrades}
                onChange={(value) => setSelectedCourseForGrades(value)}
                style={{ width: "100%", marginBottom: 16 }}
              >
                {courses.map((course) => (
                  <Select.Option key={course._id} value={course._id}>
                    {course.courseName} ({course.courseCode || "No code"})
                  </Select.Option>
                ))}
              </Select>
            )}

            <Button
              onClick={handleDownloadGradeTemplate}
              disabled={!selectedCourseForGrades}
              style={{ marginBottom: 16 }}
            >
              Download Grade Template
            </Button>
          </Form.Item>

          <Form.Item label="Upload Grade File">
            <p>
              You can add grades in bulk by uploading an Excel or CSV file.
            </p>
            <Upload
              fileList={gradeFileList}
              beforeUpload={(file) => {
                console.log("beforeUpload called with file:", file);
                const isExcelOrCsv =
                  file.type ===
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                  file.type === "application/vnd.ms-excel" ||
                  file.type === "text/csv";
                if (!isExcelOrCsv) {
                  message.error(
                    "Only Excel or CSV files are allowed!"
                  );
                  return false;
                }
                setGradeFileList([
                  {
                    uid: file.uid || "1",
                    name: file.name,
                    status: "done",
                    originFileObj: file,
                  },
                ]);
                console.log("File selected:", file.name);
                return false;
              }}
              onRemove={() => {
                console.log("Removing file");
                setGradeFileList([]);
              }}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
        </Form>
        <div style={{ marginTop: 16, textAlign: "right" }}>
          <Button onClick={testFileUpload} style={{ marginRight: 8 }}>
            Test Upload
          </Button>
          <Button
            onClick={() => {
              setIsAddGradeFileModalVisible(false);
              setGradeFileList([]);
              setSelectedCourseForGrades(null);
            }}
            style={{ marginRight: 8 }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleAddGradeFileSubmit}
            disabled={gradeFileList.length === 0}
          >
            Upload
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardIns;
