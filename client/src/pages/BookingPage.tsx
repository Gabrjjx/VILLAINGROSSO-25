import { useLanguage } from "@/context/LanguageContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import BookingForm from "@/components/BookingForm";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/framer-animations";

export default function BookingPageWrapper() {
  return (
    <ProtectedRoute>
      <BookingPage />
    </ProtectedRoute>
  );
}

function BookingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="container mx-auto">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-primary mb-2">{t("bookingPage.title")}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("bookingPage.description")}
          </p>
        </motion.div>
        <BookingForm />
      </div>
    </div>
  );
}