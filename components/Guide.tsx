import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';

interface GuideProps {
  isMinimized: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
}

const GUIDE_SHOWN_KEY = 'guideShown';

const guideSteps = [
  {
    title: "Welcome to CopyTrade Pro!",
    content: "This platform helps you track and analyze the best performing wallets for copy trading."
  },
  {
    title: "Filter Wallets",
    content: "Use the filters above to find wallets matching your criteria for ROI, win rate, and trade count."
  },
  {
    title: "Detailed Analytics",
    content: "Click on any wallet card to view detailed performance metrics and trading history."
  }
];

export const Guide = ({ isMinimized, onMinimize, onMaximize }: GuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check if guide has been shown before
    const hasGuideBeenShown = localStorage.getItem(GUIDE_SHOWN_KEY);
    if (!hasGuideBeenShown) {
      setShouldShow(true);
      // Mark guide as shown
      localStorage.setItem(GUIDE_SHOWN_KEY, 'true');
    }
  }, []);

  // If guide shouldn't be shown, return null
  if (!shouldShow) return null;

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-4 right-4 bg-gray-800 rounded-full p-3 cursor-pointer shadow-lg z-50"
        onClick={onMaximize}
      >
        <MessageCircle className="text-white w-6 h-6" />
      </motion.div>
    );
  }

  const handleFinish = () => {
    onMinimize();
    setShouldShow(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6"
        >
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-white">Platform Guide</h3>
            <button
              onClick={handleFinish}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="text-white">
              <h4 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">{guideSteps[currentStep].title}</h4>
              <p className="text-gray-300 text-sm sm:text-base">{guideSteps[currentStep].content}</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="flex space-x-2">
                {guideSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                      currentStep === index ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded text-sm font-medium transition-colors ${
                    currentStep === 0
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-white hover:bg-gray-700'
                  }`}
                  disabled={currentStep === 0}
                >
                  Previous
                </button>
                {currentStep === guideSteps.length - 1 ? (
                  <button
                    onClick={handleFinish}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    Get Started
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentStep(Math.min(guideSteps.length - 1, currentStep + 1))}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}; 