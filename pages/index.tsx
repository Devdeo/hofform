import type { NextPage } from "next";
import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import SignatureCanvas from "react-signature-canvas";

const SignatureCanvasComponent = dynamic<any>(() => import("react-signature-canvas"), {
  ssr: false,
});

interface FormData {
  hofName: string;
  hofAddress1: string;
  hofAddress2: string;
  hofAadhaar: string;
  residentName: string;
  residentAadhaar: string;
  relationship: string;
  residentName2: string;
  residentName3: string;
  date: string;
}

const filledTextStyle: React.CSSProperties = {
  fontFamily: "'Caveat', cursive",
  color: "#0000CD",
  fontWeight: "bold",
  fontSize: "30px",
  letterSpacing: "0.5px",
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

const Home: NextPage = () => {
  const [formData, setFormData] = useState<FormData>({
    hofName: "",
    hofAddress1: "",
    hofAddress2: "",
    hofAadhaar: "",
    residentName: "",
    residentAadhaar: "",
    relationship: "",
    residentName2: "",
    residentName3: "",
    date: "",
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/check-auth");
        const data = await response.json();
        
        if (data.authenticated) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, []);
  const [isPreview, setIsPreview] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [signatureData, setSignatureData] = useState<string>("");
  const sigCanvas = useRef<SignatureCanvas>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setSignatureData("");
  };

  const handleUploadSignature = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSignatureData(result);
        if (sigCanvas.current) {
          sigCanvas.current.clear();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreview = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty() && !signatureData) {
      setSignatureData(sigCanvas.current.toDataURL());
    }
    setIsPreview(true);
  };

  const handleEdit = () => {
    setIsPreview(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setIsVerifying(true);

    try {
      const response = await fetch("/api/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        setPasswordInput("");
      } else {
        setPasswordError(data.message || "Incorrect password");
      }
    } catch (error) {
      setPasswordError("Failed to verify password. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;

    setIsGeneratingPDF(true);

    try {
      const canvas = await toPng(printRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (printRef.current.offsetHeight * imgWidth) / printRef.current.offsetWidth;

      pdf.addImage(canvas, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("self-declaration-form.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div style={{ backgroundColor: "#f0f0f0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Head>
          <title>Self-Declaration Form</title>
          <meta name="description" content="Self-Declaration Form for HOF" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "18px", color: "#666" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: "#f0f0f0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Head>
          <title>Self-Declaration Form - Login</title>
          <meta name="description" content="Self-Declaration Form for HOF" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", maxWidth: "400px", width: "100%" }}>
          <h1 style={{ textAlign: "center", color: "#e30613", marginBottom: "10px", fontSize: "24px" }}>Self-Declaration Form</h1>
          <p style={{ textAlign: "center", color: "#666", marginBottom: "30px", fontSize: "14px" }}>Please enter the password to access the form</p>
          
          <form onSubmit={handlePasswordSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="password" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>Password</label>
              <input
                type="password"
                id="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "16px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                placeholder="Enter password"
                required
              />
            </div>

            {passwordError && (
              <div style={{ backgroundColor: "#ffebee", color: "#c62828", padding: "10px", borderRadius: "4px", marginBottom: "20px", fontSize: "14px" }}>
                {passwordError}
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              style={{
                width: "100%",
                backgroundColor: "#e30613",
                color: "white",
                padding: "12px",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: isVerifying ? "not-allowed" : "pointer",
                opacity: isVerifying ? 0.6 : 1,
              }}
            >
              {isVerifying ? "Verifying..." : "Access Form"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f0f0f0", minHeight: "100vh", padding: "20px" }}>
      <Head>
        <title>Self-Declaration Form</title>
        <meta name="description" content="Self-Declaration Form for HOF" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {!isPreview && (
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <button
              onClick={handlePreview}
              style={{
                backgroundColor: "#e30613",
                color: "white",
                padding: "12px 24px",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              Preview Form
            </button>
          </div>
        )}

        {isPreview && (
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <button
              onClick={handleEdit}
              style={{
                backgroundColor: "#666",
                color: "white",
                padding: "12px 24px",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              Edit Form
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              style={{
                backgroundColor: "#e30613",
                color: "white",
                padding: "12px 24px",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                cursor: isGeneratingPDF ? "not-allowed" : "pointer",
                opacity: isGeneratingPDF ? 0.6 : 1,
              }}
            >
              {isGeneratingPDF ? "Generating PDF..." : "Download as PDF"}
            </button>
          </div>
        )}

        <div
          ref={printRef}
          style={{
            width: "21cm",
            minHeight: "29.7cm",
            backgroundColor: "white",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            padding: "2cm",
            boxSizing: "border-box",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              backgroundColor: "#e30613",
              color: "white",
              padding: "10px 0",
              textAlign: "center",
              margin: "-2cm -2cm 20px -2cm",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1.1em", lineHeight: "1.4" }}>
              SELF-DECLARATION FROM THE HEAD OF FAMILY (HOF) FOR SHARING ADDRESS
              <br />
              WITH IMMEDIATE FAMILY MEMBER RESIDING AT THE SAME ADDRESS
            </h3>
          </div>

          <div style={{ marginBottom: "15px", lineHeight: "1.8" }}>
            <p style={{ marginBottom: "10px", textAlign: "justify" }}>
              I,{" "}
              {isPreview ? (
                <span style={{ borderBottom: "1px solid black", display: "inline-block", minWidth: "300px", paddingBottom: "2px", ...filledTextStyle }}>
                  {formData.hofName || "\u00A0"}
                </span>
              ) : (
                <input
                  type="text"
                  name="hofName"
                  value={formData.hofName}
                  onChange={handleInputChange}
                  placeholder="Name as in Aadhaar"
                  style={{
                    border: "none",
                    borderBottom: "2px solid #e30613",
                    minWidth: "300px",
                    fontSize: "14px",
                    padding: "2px 4px",
                    outline: "none",
                  }}
                />
              )}{" "}
              (Name as in Aadhaar), resident of
            </p>
            {isPreview ? (
              <>
                <span style={{ borderBottom: "1px solid black", display: "block", width: "100%", paddingBottom: "2px", marginBottom: "5px", ...filledTextStyle }}>
                  {formData.hofAddress1 || "\u00A0"}
                </span>
                <span style={{ borderBottom: "1px solid black", display: "block", width: "100%", paddingBottom: "2px", marginBottom: "5px", ...filledTextStyle }}>
                  {formData.hofAddress2 || "\u00A0"}
                </span>
              </>
            ) : (
              <>
                <input
                  type="text"
                  name="hofAddress1"
                  value={formData.hofAddress1}
                  onChange={handleInputChange}
                  placeholder="Address line 1"
                  style={{
                    border: "none",
                    borderBottom: "2px solid #e30613",
                    width: "100%",
                    fontSize: "14px",
                    padding: "2px 4px",
                    marginBottom: "5px",
                    outline: "none",
                  }}
                />
                <input
                  type="text"
                  name="hofAddress2"
                  value={formData.hofAddress2}
                  onChange={handleInputChange}
                  placeholder="Address line 2"
                  style={{
                    border: "none",
                    borderBottom: "2px solid #e30613",
                    width: "100%",
                    fontSize: "14px",
                    padding: "2px 4px",
                    marginBottom: "5px",
                    outline: "none",
                  }}
                />
              </>
            )}
            <p style={{ marginTop: "5px", textAlign: "justify" }}>
              (Address as provided in Aadhaar) holding Aadhaar Number{" "}
              {isPreview ? (
                <span style={{ borderBottom: "1px solid black", display: "inline-block", minWidth: "200px", paddingBottom: "2px", ...filledTextStyle }}>
                  {formData.hofAadhaar || "\u00A0"}
                </span>
              ) : (
                <input
                  type="text"
                  name="hofAadhaar"
                  value={formData.hofAadhaar}
                  onChange={handleInputChange}
                  placeholder="Aadhaar Number"
                  style={{
                    border: "none",
                    borderBottom: "2px solid #e30613",
                    minWidth: "200px",
                    fontSize: "14px",
                    padding: "2px 4px",
                    outline: "none",
                  }}
                />
              )}
              , do hereby solemnly affirm and declare as under:-
            </p>
          </div>

          <div style={{ marginLeft: "30px", marginBottom: "15px" }}>
            <p style={{ marginBottom: "10px", lineHeight: "1.8", textAlign: "justify" }}>
              <span style={{ display: "inline-block", width: "20px" }}>i.</span> That resident Mr./Ms.{" "}
              {isPreview ? (
                <span style={{ borderBottom: "1px solid black", display: "inline-block", minWidth: "200px", paddingBottom: "2px", ...filledTextStyle }}>
                  {formData.residentName || "\u00A0"}
                </span>
              ) : (
                <input
                  type="text"
                  name="residentName"
                  value={formData.residentName}
                  onChange={handleInputChange}
                  placeholder="Resident Name"
                  style={{
                    border: "none",
                    borderBottom: "2px solid #e30613",
                    minWidth: "200px",
                    fontSize: "14px",
                    padding: "2px 4px",
                    outline: "none",
                  }}
                />
              )}{" "}
              holding Aadhaar number{" "}
              {isPreview ? (
                <span style={{ borderBottom: "1px solid black", display: "inline-block", minWidth: "200px", paddingBottom: "2px", ...filledTextStyle }}>
                  {formData.residentAadhaar || "\u00A0"}
                </span>
              ) : (
                <input
                  type="text"
                  name="residentAadhaar"
                  value={formData.residentAadhaar}
                  onChange={handleInputChange}
                  placeholder="Resident Aadhaar"
                  style={{
                    border: "none",
                    borderBottom: "2px solid #e30613",
                    minWidth: "200px",
                    fontSize: "14px",
                    padding: "2px 4px",
                    outline: "none",
                  }}
                />
              )}{" "}
              is related to me as my{" "}
              {isPreview ? (
                <span style={{ borderBottom: "1px solid black", display: "block", width: "100%", paddingBottom: "2px", marginTop: "5px", ...filledTextStyle }}>
                  {formData.relationship || "\u00A0"}
                </span>
              ) : (
                <input
                  type="text"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleInputChange}
                  placeholder="Relationship (e.g., Son, Daughter, Spouse)"
                  style={{
                    border: "none",
                    borderBottom: "2px solid #e30613",
                    width: "100%",
                    fontSize: "14px",
                    padding: "2px 4px",
                    marginTop: "5px",
                    outline: "none",
                  }}
                />
              )}
              <br />
              (Please specify the relation with applicant) and is residing with me at the above mentioned address.
            </p>
          </div>

          <div style={{ marginLeft: "30px", marginBottom: "15px" }}>
            <p style={{ marginBottom: "10px", lineHeight: "1.8", textAlign: "justify" }}>
              <span style={{ display: "inline-block", width: "20px" }}>ii.</span> That I agree to share my address in my Aadhaar with Mr./Ms.{" "}
              {isPreview ? (
                <span style={{ borderBottom: "1px solid black", display: "block", width: "100%", paddingBottom: "2px", marginTop: "5px", ...filledTextStyle }}>
                  {formData.residentName2 || "\u00A0"}
                </span>
              ) : (
                <input
                  type="text"
                  name="residentName2"
                  value={formData.residentName2}
                  onChange={handleInputChange}
                  placeholder="Resident Name"
                  style={{
                    border: "none",
                    borderBottom: "2px solid #e30613",
                    width: "100%",
                    fontSize: "14px",
                    padding: "2px 4px",
                    marginTop: "5px",
                    outline: "none",
                  }}
                />
              )}{" "}
              for updating his/her address in Aadhaar in my capacity of Head of the Family (HoF).
            </p>
          </div>

          <div style={{ marginLeft: "30px", marginBottom: "15px" }}>
            <p style={{ marginBottom: "10px", lineHeight: "1.8", textAlign: "justify" }}>
              <span style={{ display: "inline-block", width: "20px" }}>iii.</span> That the undersigned undertakes that, the above mentioned information is correct to the best of my knowledge and belief and at any point of time if any of the said information is found to be incorrect/fraudulent/false, the Aadhaar of Mr./Ms.
              <br />
              {isPreview ? (
                <span style={{ borderBottom: "1px solid black", display: "block", width: "100%", paddingBottom: "2px", marginTop: "5px", ...filledTextStyle }}>
                  {formData.residentName3 || "\u00A0"}
                </span>
              ) : (
                <input
                  type="text"
                  name="residentName3"
                  value={formData.residentName3}
                  onChange={handleInputChange}
                  placeholder="Resident Name"
                  style={{
                    border: "none",
                    borderBottom: "2px solid #e30613",
                    width: "100%",
                    fontSize: "14px",
                    padding: "2px 4px",
                    marginTop: "5px",
                    outline: "none",
                  }}
                />
              )}{" "}
              and mine can be deactivated and legal action may be initiated against me, as per the provisions of the Aadhaar (Targeted Delivery of Financial and Other Subsidies, Benefits and Services) Act, 2016.
            </p>
          </div>

          <div
            style={{
              marginTop: "50px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flexGrow: 1 }}>
              <p style={{ marginBottom: "5px" }}>
                <b>Date:</b>{" "}
                {isPreview ? (
                  <span style={{ borderBottom: "1px solid black", display: "inline-block", minWidth: "150px", paddingBottom: "2px", ...filledTextStyle }}>
                    {formatDate(formData.date) || "\u00A0"}
                  </span>
                ) : (
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    style={{
                      border: "none",
                      borderBottom: "2px solid #e30613",
                      minWidth: "150px",
                      fontSize: "14px",
                      padding: "2px 4px",
                      outline: "none",
                    }}
                  />
                )}
              </p>
            </div>
            <div style={{ textAlign: "right", flexGrow: 1 }}>
              <p style={{ marginBottom: "5px" }}>
                <b>Name & Signature of Head of the Family (HoF)</b>
              </p>
              {isPreview ? (
                signatureData && (
                  <img
                    src={signatureData}
                    alt="Signature"
                    style={{ border: "1px solid #ccc", maxWidth: "250px", height: "auto" }}
                  />
                )
              ) : (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                  {signatureData ? (
                    <div>
                      <img
                        src={signatureData}
                        alt="Uploaded Signature"
                        style={{ border: "2px solid #e30613", maxWidth: "250px", height: "auto", marginBottom: "5px" }}
                      />
                    </div>
                  ) : (
                    <SignatureCanvas
                      ref={sigCanvas}
                      penColor="blue"
                      canvasProps={{
                        width: 250,
                        height: 100,
                        className: "signature-canvas",
                        style: { border: "2px solid #e30613", backgroundColor: "#fff" },
                      }}
                    />
                  )}
                  <div style={{ marginTop: "5px", display: "flex", gap: "5px", justifyContent: "flex-end" }}>
                    <button
                      onClick={handleUploadSignature}
                      style={{
                        backgroundColor: "#2196F3",
                        color: "white",
                        padding: "5px 10px",
                        border: "none",
                        borderRadius: "3px",
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      Upload Sign
                    </button>
                    <button
                      onClick={clearSignature}
                      style={{
                        backgroundColor: "#666",
                        color: "white",
                        padding: "5px 10px",
                        border: "none",
                        borderRadius: "3px",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
