
import React, { useState, useCallback } from 'react';
import Joyride, { Step, CallBackProps, STATUS, EVENTS } from 'react-joyride';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

interface ProductTourProps {
  runTour: boolean;
  onTourEnd: () => void;
}

const ProductTour = ({ runTour, onTourEnd }: ProductTourProps) => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps: Step[] = [
    {
      target: '[data-tour="create-workspace"]',
      content: (
        <div className="p-2">
          <h3 className="text-lg font-semibold text-white mb-2">Create Workspace</h3>
          <p className="text-gray-300">
            Start by creating a new workspace. This is where you'll organize your documents and conversations.
          </p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '[data-tour="upload-document"]',
      content: (
        <div className="p-2">
          <h3 className="text-lg font-semibold text-white mb-2">Upload Document</h3>
          <p className="text-gray-300">
            Upload PDF documents to your workspace. These will be available for you to ask questions about.
          </p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '[data-tour="scrape-website"]',
      content: (
        <div className="p-2">
          <h3 className="text-lg font-semibold text-white mb-2">Scrape Website</h3>
          <p className="text-gray-300">
            Scrape content from websites by providing a URL. The content will be added to your workspace.
          </p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '[data-tour="ask-question"]',
      content: (
        <div className="p-2">
          <h3 className="text-lg font-semibold text-white mb-2">Ask a Question</h3>
          <p className="text-gray-300">
            Type your questions here and get AI-powered answers based on your documents and/or websites.
          </p>
        </div>
      ),
      placement: 'top',
      disableBeacon: true,
    },
    {
      target: '[data-tour="session-info"]',
      content: (
        <div className="p-2">
          <h3 className="text-lg font-semibold text-white mb-2">View History</h3>
          <p className="text-gray-300">
            See your current session documents and/or websites.
          </p>
        </div>
      ),
      placement: 'top',
      disableBeacon: true,
    },
    {
      target: '[data-tour="edit-workspace"]',
      content: (
        <div className="p-2">
          <h3 className="text-lg font-semibold text-white mb-2">Edit Workspace</h3>
          <p className="text-gray-300">
            Edit your workspace name or delete workspaces you no longer need using these options.
          </p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '[data-tour="history-info"]',
      content: (
        <div className="p-2">
          <h3 className="text-lg font-semibold text-white mb-2">View History</h3>
          <p className="text-gray-300">
            Access your chat history and previous conversations within this workspace.
          </p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
    },
  ];

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, type, index } = data;

    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      setStepIndex(0);
      onTourEnd();
    } else if (type === EVENTS.STEP_AFTER) {
      setStepIndex(index + 1);
    }
  }, [onTourEnd]);

  return (
    <Joyride
      steps={steps}
      run={runTour}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#A259FF',
          backgroundColor: '#1f2937',
          textColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.4)',
          arrowColor: '#1f2937',
          zIndex: 10000,
        },
        tooltip: {
          backgroundColor: '#1f2937',
          borderRadius: '8px',
          border: '1px solid #374151',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        tooltipContent: {
          padding: '16px',
        },
        buttonNext: {
          backgroundColor: '#A259FF',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
        },
        buttonBack: {
          backgroundColor: '#374151',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          marginRight: '8px',
        },
        buttonSkip: {
          backgroundColor: 'transparent',
          color: '#9ca3af',
          border: 'none',
          fontSize: '14px',
          cursor: 'pointer',
        },
        buttonClose: {
          backgroundColor: 'transparent',
          color: '#9ca3af',
          border: 'none',
          fontSize: '18px',
          cursor: 'pointer',
          position: 'absolute',
          right: '8px',
          top: '8px',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
};

export default ProductTour;
