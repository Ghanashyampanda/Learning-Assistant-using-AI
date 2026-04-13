import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  ArrowLeft,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Shuffle,
  Printer,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";

import flashcardService from "../../services/flashcardService";
import aiService from "../../services/aiService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Flashcard from "../../components/flashcards/Flashcard";

const FlashcardPage = () => {

  const { id: documentId } = useParams();
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const printRef = useRef(null);

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      const response = await flashcardService.getFlashcardsForDocument(
        documentId
      );
      setFlashcardSets(response.data[0]);
      setFlashcards(response.data[0]?.cards || []);
    } catch (error) {
      toast.error("Failed to fetch flashcards.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, [documentId]);

  const handleGenerateFlashcards = async () => {
    setGenerating(true);
    try {
      await aiService.generateFlashcards(documentId);
      toast.success("Flashcards generated successfully!");
      fetchFlashcards();
    } catch (error) {
      toast.error(error.message || "Failed to generate flashcards.");
    } finally {
      setGenerating(false);
    }
  };

  const handleNextCard = () => {
    handleReview(currentCardIndex);
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
  };

  const handlePrevCard = () => {
    handleReview(currentCardIndex);
    setCurrentCardIndex(
      (prevIndex) =>
        (prevIndex - 1 + flashcards.length) % flashcards.length);
  };

  const handleReview = async (index) => {
    const currentCard = flashcards[currentCardIndex];
    if (!currentCard) return;

    try {
      await flashcardService.reviewFlashcard(currentCard._id, index);
      toast.success("Flashcard reviewed!");
    } catch (error) {
      toast.error("Failed to review flashcard.");
    }
  };

  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId);
      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((card) =>
          card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
        )
      );
      toast.success("Flashcard starred status updated!");
    } catch (error) {
      toast.error("Failed to update star status.");
    }
  };

  const handleToggleLearned = async (cardId) => {
    try {
      await flashcardService.toggleLearned(cardId);
      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((card) =>
          card._id === cardId ? { ...card, isLearned: !card.isLearned } : card
        )
      );
      toast.success("Flashcard learned status updated!");
    } catch (error) {
      toast.error("Failed to update learned status.");
    }
  };

  const handleShuffle = () => {
    setFlashcards((prevFlashcards) => {
      const shuffled = [...prevFlashcards];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
    setCurrentCardIndex(0);
    toast.success("Flashcards shuffled!");
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Flashcards",
  });

  // Fallback for v2 of react-to-print if contentRef doesn't work
  const handlePrintLegacy = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "Flashcards",
  });

  const triggerPrint = () => {
    try {
      handlePrint();
    } catch {
      handlePrintLegacy();
    }
  };

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    try {
      toast.loading("Generating PDF...", { id: "pdfLoading" });
      
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, options) {
        if (type === '2d') {
          options = options || {};
          options.willReadFrequently = true;
        }
        return originalGetContext.call(this, type, options);
      };

      let canvas;
      try {
        canvas = await html2canvas(element, { scale: 2, useCORS: true });
      } finally {
        HTMLCanvasElement.prototype.getContext = originalGetContext;
      }
      
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = position - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save("flashcards.pdf");
      
      toast.success("PDF Downloaded!", { id: "pdfLoading" });
    } catch (error) {
      toast.error("Failed to generate PDF", { id: "pdfLoading" });
      console.error(error);
    }
  };

  const handleDeleteFlashcardSet = async () => {
    setDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(flashcardSets._id);
      toast.success("Flashcard set deleted successfully!");
      setIsDeleteModalOpen(false);
      fetchFlashcards();// Refresh the flashcard sets after deletion
    } catch (error) {
      toast.error(error.message || "Failed to delete flashcard set.");
    } finally {
      setDeleting(false);
    }
  };

  const renderFlashcardContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (flashcards.length === 0) {
      return (
        <EmptyState
          title="No Flashcards Yet"
          description="Generate flashcards from your document to start learning."
        />
      );
    }

    const currentCard = flashcards[currentCardIndex];

    return (
      <div className="flex flex-col items-center space-y-6">
        <div className="w-full max-w-md">
          <Flashcard 
            flashcard={currentCard} 
            onToggleStar={handleToggleStar} 
            onToggleLearned={handleToggleLearned}
          />
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handlePrevCard}
            variant="secondary"
            disabled={flashcards.length <= 1}
          >
            <ChevronLeft size={16} /> Previous
          </Button>
          <span className="text-sm text-neutral-600">
            {currentCardIndex + 1} / {flashcards.length}
          </span>
          <Button
            onClick={handleNextCard}
            variant="secondary"
            disabled={flashcards.length <= 1}
          >
            Next <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <Link
          to={`/documents/${documentId}`}
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Document
        </Link>
      </div>
      <PageHeader title="Flashcards">
        <div className="flex gap-2">
          {!loading && flashcards.length > 0 ? (
            <>
              <Button
                onClick={handleShuffle}
                variant="secondary"
                disabled={flashcards.length <= 1}
              >
                <Shuffle size={16} /> Shuffle
              </Button>
              <Button
                onClick={triggerPrint}
                variant="secondary"
                className="hidden md:flex"
              >
                <Printer size={16} /> Print
              </Button>
              <Button
                onClick={handleDownloadPDF}
                variant="secondary"
              >
                <Download size={16} /> PDF
              </Button>
              <Button
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={deleting}
              >
                <Trash2 size={16} /> Delete Set
              </Button>
            </>
          ) : (
            <Button
              onClick={handleGenerateFlashcards}
              disabled={generating}
            >
              {generating ? (
                <Spinner />
              ) : (
                <>
                  <Plus size={16} /> Generate Flashcards
                </>
              )}
            </Button>
          )}
        </div>
      </PageHeader>

      {renderFlashcardContent()}

      {/* Hidden Print Container */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <div ref={printRef} className="print-content" style={{ padding: "40px", backgroundColor: "white", width: "800px", color: "black", margin: "0 auto" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px", textAlign: "center" }}>Flashcards Study Set</h1>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {flashcards.map((card, index) => (
              <div key={index} style={{ border: "1px solid #e2e8f0", padding: "20px", borderRadius: "8px", pageBreakInside: "avoid" }}>
                <p style={{ fontWeight: "600", fontSize: "16px", marginBottom: "8px", color: "#0f172a" }}>Q{index + 1}: {card.question}</p>
                <hr style={{ margin: "10px 0", borderColor: "#e2e8f0" }} />
                <p style={{ fontSize: "16px", color: "#334155" }}><strong>A:</strong> {card.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete Flashcard Set"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Are you sure you want to delete all flashcards for this document?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteFlashcardSet}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 active:bg-red-700 focus:ring-red-500"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );

};

export default FlashcardPage;