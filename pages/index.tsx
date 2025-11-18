import type { NextPage } from "next";
import Head from "next/head";
import { useState, useRef } from "react";
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

  const [isPreview, setIsPreview] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [signatureData, setSignatureData] = useState<string>("");
  const sigCanvas = useRef<SignatureCanvas>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  const handlePreview = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      setSignatureData(sigCanvas.current.toDataURL());
    }
    setIsPreview(true);
  };

  const handleEdit = () => {
    setIsPreview(false);
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

  return (
    <div style={{ backgroundColor: "#f0f0f0", minHeight: "100vh", padding: "20px" }}>
      <Head>
        <title>Self-Declaration Form</title>
        <meta name="description" content="Self-Declaration Form for HOF" />
        <link rel="icon" href="/favicon.ico" />
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
                <span style={{ borderBottom: "1px solid black", display: "inline-block", minWidth: "300px", paddingBottom: "2px" }}>
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
                <span style={{ borderBottom: "1px solid black", display: "block", width: "100%", paddingBottom: "2px", marginBottom: "5px" }}>
                  {formData.hofAddress1 || "\u00A0"}
                </span>
                <span style={{ borderBottom: "1px solid black", display: "block", width: "100%", paddingBottom: "2px", marginBottom: "5px" }}>
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
                <span style={{ borderBottom: "1px solid black", display: "inline-block", minWidth: "200px", paddingBottom: "2px" }}>
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
                <span style={{ borderBottom: "1px solid black", display: "inline-block", minWidth: "200px", paddingBottom: "2px" }}>
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
                <span style={{ borderBottom: "1px solid black", display: "inline-block", minWidth: "200px", paddingBottom: "2px" }}>
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
                <span style={{ borderBottom: "1px solid black", display: "block", width: "100%", paddingBottom: "2px", marginTop: "5px" }}>
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
                <span style={{ borderBottom: "1px solid black", display: "block", width: "100%", paddingBottom: "2px", marginTop: "5px" }}>
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
                <span style={{ borderBottom: "1px solid black", display: "block", width: "100%", paddingBottom: "2px", marginTop: "5px" }}>
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
                  <span style={{ borderBottom: "1px solid black", display: "inline-block", minWidth: "150px", paddingBottom: "2px" }}>
                    {formData.date || "\u00A0"}
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
                  <button
                    onClick={clearSignature}
                    style={{
                      marginTop: "5px",
                      backgroundColor: "#666",
                      color: "white",
                      padding: "5px 10px",
                      border: "none",
                      borderRadius: "3px",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Clear Signature
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: "40px", fontSize: "0.85em" }}>
            <p style={{ marginBottom: "5px" }}>
              <b>Note:</b>
            </p>
            <p style={{ marginBottom: "5px", fontStyle: "italic" }}>
              1. This document is valid for Head of Family (HoF) based Aadhaar address update purpose only.
            </p>
            <p style={{ marginBottom: "5px", fontStyle: "italic" }}>
              2. This document is valid for 3 months from date of issue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
