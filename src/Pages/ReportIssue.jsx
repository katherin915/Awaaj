import {
  AlertCircle,
  CheckCircle,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  Upload,
  MapPin,
  Camera,
  Loader2,
  Tag,
  Zap,
  Brain,
  Download,
  X
} from "lucide-react";
import { useState, useCallback, useMemo, useEffect } from "react";
import csrfManager from "../utils/csrfManager";
import API_BASE from "../utils/api";
import { toast } from 'react-hot-toast';

const FormInput = ({ type = "text", id, label, placeholder, value, onChange, required = false, rows, icon: Icon, disabled = false, error }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-emerald-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Icon className={`w-5 h-5 ${isFocused ? "text-emerald-500" : "text-gray-400"}`} />
          </div>
        )}
        {type === "textarea" ? (
          <textarea
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={rows}
            disabled={disabled}
            className={`w-full rounded-lg border bg-white shadow-sm transition-all duration-200
              ${Icon ? "pl-10" : "pl-3"} pr-3 py-2.5
              ${error
                ? "border-red-300 ring-2 ring-red-100"
                : isFocused
                ? "border-emerald-300 ring-2 ring-emerald-100"
                : "border-gray-200 hover:border-emerald-200"
              }
              ${disabled ? "opacity-60 cursor-not-allowed" : ""}
              placeholder:text-gray-400 text-gray-900 focus:outline-none resize-y min-h-[100px]
            `}
            required={required}
          />
        ) : (
          <input
            type={type}
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            className={`w-full rounded-lg border bg-white shadow-sm transition-all duration-200
              ${Icon ? "pl-10" : "pl-3"} pr-3 py-2.5
              ${error
                ? "border-red-300 ring-2 ring-red-100"
                : isFocused
                ? "border-emerald-300 ring-2 ring-emerald-100"
                : "border-gray-200 hover:border-emerald-200"
              }
              ${disabled ? "opacity-60 cursor-not-allowed" : ""}
              placeholder:text-gray-400 text-gray-900 focus:outline-none
            `}
            required={required}
          />
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" /> {error}
        </p>
      )}
    </div>
  );
};

export default function ReportIssue() {
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    title: "",
    description: "",
    location: "",
  });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [issueReceipt, setIssueReceipt] = useState(null);

  useEffect(() => {
    const hydrateFromUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE}/profile/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const profile = await response.json();
        setFormData((prev) => ({
          ...prev,
          email: prev.email || profile.email || "",
          phone: prev.phone || profile.phone || "",
          location: prev.location || profile.location || "",
        }));
      } catch {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;

        try {
          const parsed = JSON.parse(storedUser);
          setFormData((prev) => ({
            ...prev,
            email: prev.email || parsed.email || "",
          }));
        } catch {
          // Ignore malformed localStorage values.
        }
      }
    };

    hydrateFromUserProfile();
  }, []);

  const validateForm = useCallback(() => {
    let newErrors = {};
    if (!/^\+?[0-9]{7,15}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid phone number.";
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    // Title and Description are optional if file is present
    if (!formData.title.trim() && !file) {
      newErrors.title = "Issue title is required (or upload an image).";
    }
    if ((!formData.description.trim() || formData.description.length < 10) && !file) {
      newErrors.description = "Description must be at least 10 characters (or upload an image).";
    }
    if (!formData.location.trim()) {
      newErrors.location = "Location is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, file]);

  const handleInputChange = useCallback((field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  }, []);

  const handleFileChange = useCallback(async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);

    // Auto-analyze image with ML
    toast.success('Image uploaded! Analyzing with AI...');
    await analyzeImage(selectedFile);
  }, []);

  const analyzeImage = async (imageFile) => {
    setIsAnalyzing(true);
    try {
      // Create FormData for image analysis
      const formData = new FormData();
      formData.append('image', imageFile);

      // Call AI analysis endpoint
      const response = await fetch(`${API_BASE}/issues/analyze-image`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setAiAnalysis(result);
        
        // Auto-fill form based on AI analysis
        if (result.suggestedTitle) {
          setFormData(prev => ({ ...prev, title: result.suggestedTitle }));
        }
        if (result.suggestedDescription) {
          setFormData(prev => ({ ...prev, description: result.suggestedDescription }));
        }

        toast.success('AI analysis complete! Form auto-filled.');
      } else {
        console.error('Image analysis failed');
        toast.error('AI analysis failed, but you can still submit manually.');
      }
    } catch (error) {
      console.error('Image analysis error:', error);
      toast.error('Could not analyze image, but you can still submit.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    setAiAnalysis(null);
  };

  const downloadReceipt = useCallback((issueData) => {
    const receipt = `
═══════════════════════════════════════
           AWAAJ - ISSUE RECEIPT
═══════════════════════════════════════

ISSUE ID: ${issueData._id || issueData.id}
DATE: ${new Date().toLocaleString()}

═══════════════════════════════════════
                 DETAILS
═══════════════════════════════════════

Title: ${issueData.title}
Category: ${issueData.category || 'Other'}
Priority: ${issueData.priority || issueData.priorityLevel || 'Normal'}
Location: ${issueData.location?.address || formData.location}

═══════════════════════════════════════
              AI ANALYSIS
═══════════════════════════════════════

Category Confidence: ${((issueData.categoryConfidence || 0) * 100).toFixed(1)}%
Priority Score: ${issueData.priorityScore || 50}/100
SLA Deadline: ${issueData.slaDeadline ? new Date(issueData.slaDeadline).toLocaleString() : 'N/A'}

═══════════════════════════════════════
              CONTACT INFO
═══════════════════════════════════════

Email: ${issueData.email}
Phone: ${issueData.phone}

═══════════════════════════════════════

Thank you for using Awaaj!
Your issue has been registered and will
be addressed according to its priority.

Track your issue at:
http://localhost:3000/issues/${issueData._id || issueData.id}

═══════════════════════════════════════
    `;

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `issue-receipt-${issueData._id || Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Receipt downloaded!');
  }, [formData.location]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    if (!validateForm()) {
      setSubmitStatus("error");
      toast.error('Please fill all required fields correctly');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("phone", formData.phone);
      data.append("email", formData.email);
      data.append("location", formData.location);
      data.append("notifyByEmail", "true"); // Enable email notifications
      
      if (file) {
        data.append("file", file);
      }

      console.log('Submitting issue with data:', {
        title: formData.title,
        description: formData.description,
        phone: formData.phone,
        email: formData.email,
        location: formData.location,
        hasFile: !!file
      });

      // Try direct fetch first (bypass CSRF for testing)
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/issues`, {
        method: "POST",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
        body: data,
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Issue submitted:", result);
        setSubmitStatus("success");
        setIssueReceipt(result.issue);
        
        // Show success message with AI analysis
        const category = result.aiAnalysis?.category || result.issue?.category || 'Other';
        const priority = result.aiAnalysis?.priorityLevel || result.issue?.priority || result.issue?.priorityLevel || 'Normal';
        
        toast.success(
          `Issue submitted successfully!\nCategory: ${category}\nPriority: ${priority}`,
          { duration: 5000 }
        );
        
        // Download receipt
        downloadReceipt(result.issue);
        
        // Reset form after 10 seconds
        setTimeout(() => {
          setFormData({
            phone: "",
            email: "",
            title: "",
            description: "",
            location: "",
          });
          setFile(null);
          setFilePreview(null);
          setAiAnalysis(null);
          setIssueReceipt(null);
          setSubmitStatus(null);
        }, 10000);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Server error:', errorData);
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitStatus("error");
      toast.error(err.message || 'Failed to submit issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, file, isSubmitting, validateForm, downloadReceipt]);

  const formFields = useMemo(() => [
    { id: "phone", type: "tel", label: "Phone Number", placeholder: "+91 98765 43210", required: true, icon: Phone },
    { id: "email", type: "email", label: "Email Address", placeholder: "you@example.com", required: true, icon: Mail },
    { id: "title", type: "text", label: "Issue Title", placeholder: "Brief description (Optional with image)", required: false, icon: FileText },
    { id: "description", type: "textarea", label: "Detailed Description", placeholder: "Details about the issue (Optional with image)", rows: 4, required: false, icon: MessageSquare },
    { id: "location", type: "text", label: "Location", placeholder: "Detecting location...", required: true, icon: MapPin },
  ], []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          setFormData((prev) => ({ ...prev, location: data.display_name || `${latitude}, ${longitude}` }));
        } catch {
          setFormData((prev) => ({ ...prev, location: `${latitude}, ${longitude}` }));
        }
      },
      () => console.warn("Geolocation not available")
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-emerald-100/20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-green-100/20 blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-2xl mb-4">
            <AlertCircle className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Report an Issue</h1>
          <p className="text-gray-600 text-sm">Help us improve by reporting any problems you've encountered.</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 space-y-6">
          {formFields.map((field) => (
            <FormInput
              key={field.id}
              {...field}
              value={formData[field.id]}
              onChange={handleInputChange(field.id)}
              disabled={isSubmitting}
              error={errors[field.id]}
            />
          ))}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Attach Image <span className="text-gray-400">(Optional - AI will analyze it)</span>
            </label>
            
            {!file ? (
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isSubmitting ? "opacity-60 cursor-not-allowed border-gray-300" : "border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50/30 cursor-pointer"
                }`}>
                  <Camera className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                  <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400">JPG, PNG, WEBP (Max 5MB)</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span className="text-xs text-purple-600 font-medium">AI-Powered Analysis</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative border-2 border-emerald-200 rounded-lg p-4 bg-emerald-50/30">
                <button
                  onClick={removeFile}
                  disabled={isSubmitting}
                  className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {filePreview && (
                  <img 
                    src={filePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                )}
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm text-emerald-700 font-medium">{file.name}</span>
                  </div>
                  {isAnalyzing && (
                    <div className="flex items-center gap-2 text-purple-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs">Analyzing...</span>
                    </div>
                  )}
                </div>
                
                {aiAnalysis && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-semibold text-purple-700">AI Analysis</span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-700">
                      {aiAnalysis.category && (
                        <div className="flex items-center gap-2">
                          <Tag className="w-3 h-3 text-blue-500" />
                          <span><strong>Category:</strong> {aiAnalysis.category}</span>
                        </div>
                      )}
                      {aiAnalysis.confidence && (
                        <div className="flex items-center gap-2">
                          <Zap className="w-3 h-3 text-yellow-500" />
                          <span><strong>Confidence:</strong> {(aiAnalysis.confidence * 100).toFixed(1)}%</span>
                        </div>
                      )}
                      {aiAnalysis.detectedObjects && aiAnalysis.detectedObjects.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Camera className="w-3 h-3 text-green-500 mt-0.5" />
                          <span><strong>Detected:</strong> {aiAnalysis.detectedObjects.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white shadow-sm transition-all ${
              isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 hover:shadow-md"
            }`}>
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Submitting...
              </div>
            ) : ("Submit Report")}
          </button>

          {submitStatus === "success" && issueReceipt && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <span className="text-base font-semibold text-emerald-800">Issue Submitted Successfully!</span>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Issue ID:</span>
                  <span className="font-mono text-gray-800">{issueReceipt._id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium text-emerald-700">{issueReceipt.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Priority:</span>
                  <span className={`font-medium ${
                    (issueReceipt.priority || issueReceipt.priorityLevel) === 'High' ? 'text-red-600' : 
                    (issueReceipt.priority || issueReceipt.priorityLevel) === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>{issueReceipt.priority || issueReceipt.priorityLevel || 'Normal'}</span>
                </div>
                {issueReceipt.slaDeadline && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Expected Resolution:</span>
                    <span className="text-gray-800">{new Date(issueReceipt.slaDeadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => downloadReceipt(issueReceipt)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </button>
            </div>
          )}
          {submitStatus === "error" && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-700">Failed to submit. Please check errors and try again.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
