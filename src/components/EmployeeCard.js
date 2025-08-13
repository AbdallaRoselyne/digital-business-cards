import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaPhone,
  FaShare,
  FaDownload,
  FaInfoCircle,
  FaLinkedin,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { QRCodeSVG as QRCode } from "qrcode.react";
import VCARD from "vcard-creator";
import { fetchEmployeeData } from "../utilities/sheetService";

const EmployeeCard = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        setLoading(true);
        setError(null);

        const employees = await fetchEmployeeData();

        const foundEmployee = employees.find((emp) => {
          if (
            emp.id &&
            emp.id.toString().toLowerCase() === employeeId.toLowerCase()
          ) {
            return true;
          }
          if (emp.slug && emp.slug === employeeId.toLowerCase()) {
            return true;
          }
          if (emp.email) {
            const emailPrefix = emp.email.split("@")[0].toLowerCase();
            if (emailPrefix === employeeId.toLowerCase()) {
              return true;
            }
          }
          return false;
        });

        if (foundEmployee) {
          setCurrentEmployee(foundEmployee);
        } else {
          setError(`Employee not found. Searched for: ${employeeId}`);
        }
      } catch (err) {
        setError(`Failed to load employee data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      loadEmployee();
    } else {
      setError("No employee ID provided");
      setLoading(false);
    }
  }, [employeeId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-pulse text-gray-500">
          Loading employee data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-red-500 max-w-md text-center">
          {error}
          <p className="mt-4 text-sm text-gray-600">
            Please check the URL or contact support.
          </p>
        </div>
      </div>
    );
  }

  if (!currentEmployee) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-gray-500">No employee selected</div>
      </div>
    );
  }

  const employee = currentEmployee;
  const primaryColor = employee.primarycolor || "#2563EB";
  const secondaryColor = employee.secondarycolor || "#1E40AF";

  const generateShareLink = () => {
    const identifier =
      employee.id ||
      employee.name.toLowerCase().replace(/\s+/g, "-") ||
      employee.email.split("@")[0];
    return `${window.location.origin}/${identifier}`;
  };

  const handleSaveContact = () => {
    const myVCard = new VCARD();
    myVCard
      .addName(employee.name)
      .addJobtitle(employee.title)
      .addCompany(employee.company)
      .addEmail(employee.email);

    if (employee.phone) {
      myVCard.addPhoneNumber(employee.phone, "WORK");
    }
    if (employee.office) {
      myVCard.addPhoneNumber(employee.office, "WORK");
    }
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <motion.div
        className="w-full max-w-md rounded-3xl overflow-hidden shadow-xl bg-white"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div
          className="h-48 relative"
          style={{ backgroundColor: primaryColor }}
        >
          {employee.companylogo && (
            <motion.img
              src={`${employee.companylogo.replace(
                "/upload/",
                "/upload/w_400,c_scale/"
              )}`}
              alt={`${employee.company} Logo`}
              className="h-100 object-contain mx-auto pt-4"
              style={{ maxWidth: "300px" }}
            />
          )}

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

        {/* Body */}
        <div className="pt-20 pb-8 px-6 text-center">
          {/* Name & Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              {employee.name}
            </h1>
            <p className="text-md font-medium text-gray-600 mb-1">
              {employee.title}
            </p>
            <p className="text-sm text-gray-500 mb-6">{employee.company}</p>
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

            {/* Optional Phone */}
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

            {/* Optional Office */}
            {employee.office && (
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-white shadow-sm">
                  <FaPhone size={16} className="text-gray-600" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Office</p>
                  <a
                    href={`tel:${employee.office}`}
                    className="text-sm font-medium text-gray-800 hover:underline"
                  >
                    {employee.office}
                  </a>
                </div>
              </div>
            )}

            {employee.address && (
              <div className="flex items-start space-x-4 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-white shadow-sm mt-1">
                  <FaInfoCircle size={16} className="text-gray-600" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm text-gray-800">{employee.address}</p>
                </div>
              </div>
            )}

            {/* Optional LinkedIn */}
            {employee.linkedin && (
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-white shadow-sm">
                  <FaLinkedin size={16} className="text-[#0077B5]" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs text-gray-500">LinkedIn</p>
                  <a
                    href={employee.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-800 hover:underline break-all"
                    title={employee.linkedin}
                  >
                    {employee.linkedin}
                  </a>
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
    </div>
  );
};

export default EmployeeCard;
