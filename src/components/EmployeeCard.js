import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaLinkedin,
  FaTwitter,
  FaEnvelope,
  FaPhone,
  FaShare,
  FaArrowLeft,
  FaArrowRight,
  FaDownload,
  FaGlobe,
  FaInfoCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { QRCodeSVG as QRCode } from "qrcode.react";
import VCARD from "vcard-creator";
import { fetchEmployeeData } from "../utilities/sheetService";

const EmployeeCard = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchEmployeeData();
      setEmployees(data);

      if (employeeId) {
        const foundIndex = data.findIndex(
          (emp) =>
            emp.id === employeeId ||
            emp.name.toLowerCase().replace(/\s+/g, "-") === employeeId
        );
        if (foundIndex >= 0) setCurrentIndex(foundIndex);
      }
    };
    loadData();
  }, [employeeId]);

  if (employees.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  const employee = employees[currentIndex];
  const primaryColor = employee.primarycolor || "#2563EB";
  const secondaryColor = employee.secondarycolor || "#1E40AF";

  const generateShareLink = () => {
    const identifier =
      employee.id || employee.name.toLowerCase().replace(/\s+/g, "-");
    return `${window.location.origin}/${identifier}`;
  };

  const handleSaveContact = () => {
    const myVCard = new VCARD();
    myVCard
      .addName(employee.name)
      .addJobtitle(employee.title)
      .addCompany(employee.company)
      .addEmail(employee.email)
      .addPhoneNumber(employee.phone, "WORK");

    if (employee.photourl) {
      myVCard.addPhotoURL(employee.photourl);
    }

    const blob = new Blob([myVCard.toString()], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${employee.name.replace(" ", "_")}.vcf`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${employee.name}'s Digital Business Card`,
      text: `Connect with ${employee.name}, ${employee.title} at ${employee.company}`,
      url: generateShareLink(),
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(generateShareLink());
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const navigateToEmployee = (index) => {
    const employee = employees[index];
    const identifier =
      employee.id || employee.name.toLowerCase().replace(/\s+/g, "-");
    navigate(`/${identifier}`);
    setCurrentIndex(index);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      {/* Main Card Container */}
      <motion.div
        className="w-full max-w-md rounded-3xl overflow-hidden shadow-xl bg-white"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Card Header with Gradient */}
        <div 
          className="h-48 relative"
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
          }}
        >
          {/* Company Logo */}
          {employee.companylogo && (
            <motion.img
              src={`${employee.companylogo.replace(
                "/upload/",
                "/upload/w_300,c_scale/"
              )}`}
              alt={`${employee.company} Logo`}
              className="absolute top-6 left-6 h-10 object-contain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            />
          )}
          
          {/* Profile Picture */}
          <motion.div
            className="absolute -bottom-16 left-1/2 transform -translate-x-1/2"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative">
              <img
                src={
                  employee.photourl
                    ? `${employee.photourl.replace(
                        "/upload/",
                        "/upload/q_auto,f_webp,w_200,h_200,c_fill,g_face/"
                      )}`
                    : "https://via.placeholder.com/200"
                }
                alt={employee.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/200";
                }}
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>

        {/* Card Body */}
        <div className="pt-20 pb-8 px-6 text-center">
          {/* Name & Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{employee.name}</h1>
            <p className="text-md font-medium text-gray-600 mb-1">
              {employee.title}
            </p>
            <p className="text-sm text-gray-500 mb-6">{employee.company}</p>
          </motion.div>

          {/* Social Links - Horizontal */}
          <motion.div
            className="flex justify-center space-x-4 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {employee.email && (
              <motion.a
                href={`mailto:${employee.email}`}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100"
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Email"
              >
                <FaEnvelope size={18} className="text-gray-700" />
              </motion.a>
            )}
            {employee.linkedin && (
              <motion.a
                href={employee.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100"
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="LinkedIn"
              >
                <FaLinkedin size={18} className="text-[#0077B5]" />
              </motion.a>
            )}
            {employee.twitter && (
              <motion.a
                href={`https://twitter.com/${employee.twitter.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100"
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Twitter"
              >
                <FaTwitter size={18} className="text-[#1DA1F2]" />
              </motion.a>
            )}
            {employee.phone && (
              <motion.a
                href={`tel:${employee.phone}`}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100"
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Phone"
              >
                <FaPhone size={18} className="text-gray-700" />
              </motion.a>
            )}
          </motion.div>

          {/* Contact Details - Vertical List */}
          <motion.div
            className="space-y-4 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {employee.email && (
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-white shadow-sm">
                  <FaEnvelope size={16} className="text-gray-600" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Email</p>
                  <a
                    href={`mailto:${employee.email}`}
                    className="text-sm font-medium text-gray-800 hover:underline truncate"
                    title={employee.email}
                  >
                    {employee.email}
                  </a>
                </div>
              </div>
            )}

            {employee.phone && (
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-white shadow-sm">
                  <FaPhone size={16} className="text-gray-600" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Phone</p>
                  <a
                    href={`tel:${employee.phone}`}
                    className="text-sm font-medium text-gray-800 hover:underline"
                  >
                    {employee.phone}
                  </a>
                </div>
              </div>
            )}

            {employee.bio && (
              <div className="flex items-start space-x-4 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-white shadow-sm mt-1">
                  <FaInfoCircle size={16} className="text-gray-600" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs text-gray-500">About</p>
                  <p className="text-sm text-gray-800">{employee.bio}</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* QR Code Section */}
          <motion.div
            className="flex flex-col items-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-xs text-gray-500 mb-3">Scan to connect</p>
            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
              <QRCode
                value={generateShareLink()}
                size={120}
                level="H"
                fgColor={secondaryColor}
                bgColor="#FFFFFF"
                includeMargin={true}
              />
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <motion.button
              onClick={handleShare}
              className="py-3 px-4 rounded-xl flex items-center justify-center space-x-2 font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaShare size={16} />
              <span>{isCopied ? "Copied!" : "Share"}</span>
            </motion.button>

            <motion.button
              onClick={handleSaveContact}
              className="py-3 px-4 rounded-xl flex items-center justify-center space-x-2 font-medium text-white hover:opacity-90 transition-opacity duration-200"
              style={{ backgroundColor: secondaryColor }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaDownload size={16} />
              <span>Save Contact</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Navigation for multiple employees */}
      {employees.length > 1 && (
        <motion.div
          className="flex items-center mt-8 space-x-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            onClick={() =>
              navigateToEmployee(
                currentIndex > 0 ? currentIndex - 1 : employees.length - 1
              )
            }
            className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-200"
            whileHover={{ x: -2, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Previous"
          >
            <FaArrowLeft size={18} className="text-gray-700" />
          </motion.button>

          <span className="text-sm font-medium text-gray-700">
            {currentIndex + 1} / {employees.length}
          </span>

          <motion.button
            onClick={() =>
              navigateToEmployee(
                currentIndex < employees.length - 1 ? currentIndex + 1 : 0
              )
            }
            className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-200"
            whileHover={{ x: 2, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Next"
          >
            <FaArrowRight size={18} className="text-gray-700" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default EmployeeCard;