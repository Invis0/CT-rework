import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, MessageCircle } from 'lucide-react';

interface GuideProps {
  isMinimized: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
}

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

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-4 right-4 bg-gray-800 rounded-full p-3 cursor-pointer shadow-lg"
        onClick={onMaximize}
      >
        <MessageCircle className="text-white w-6 h-6" />
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 w-80 bg-gray-800 rounded-lg shadow-xl p-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold">Platform Guide</h3>
          <button
            onClick={onMinimize}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-white">
            <h4 className="font-medium mb-2">{guideSteps[currentStep].title}</h4>
            <p className="text-gray-300 text-sm">{guideSteps[currentStep].content}</p>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {guideSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    currentStep === index ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                className={`px-3 py-1 rounded text-sm ${
                  currentStep === 0
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-white hover:bg-gray-700'
                }`}
                disabled={currentStep === 0}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentStep(Math.min(guideSteps.length - 1, currentStep + 1))}
                className={`px-3 py-1 rounded text-sm ${
                  currentStep === guideSteps.length - 1
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-white hover:bg-gray-700'
                }`}
                disabled={currentStep === guideSteps.length - 1}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}; 