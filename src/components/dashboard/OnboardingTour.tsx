import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Target, 
  Lightbulb,
  CheckCircle,
  Sparkles
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingTourProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingTour = ({ isVisible, onComplete, onSkip }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to CareerPathak!',
      description: 'Let\'s take a quick tour to help you get started on your career journey.',
      target: '.dashboard-header',
      position: 'bottom'
    },
    {
      id: 'stats',
      title: 'Your Career Dashboard',
      description: 'These cards show your progress and important metrics. Click on any card to explore further.',
      target: '.stats-cards',
      position: 'bottom'
    },
    {
      id: 'quiz',
      title: 'Start with the Aptitude Quiz',
      description: 'This is your most important first step! The quiz helps us understand your interests and strengths.',
      target: '.quick-actions',
      position: 'left',
      action: {
        label: 'Take Quiz Now',
        onClick: () => {
          // Navigate to quiz
          window.location.href = '/quiz';
        }
      }
    },
    {
      id: 'recommendations',
      title: 'Personalized Recommendations',
      description: 'After completing the quiz, you\'ll see your stream matches and college recommendations here.',
      target: '.recommendations-tab',
      position: 'top'
    },
    {
      id: 'notifications',
      title: 'Stay Updated',
      description: 'Important deadlines, scholarship alerts, and admission updates will appear here.',
      target: '.notifications-section',
      position: 'left'
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  useEffect(() => {
    if (isVisible && currentStepData) {
      // Highlight the target element
      const targetElement = document.querySelector(currentStepData.target);
      if (targetElement) {
        targetElement.classList.add('onboarding-highlight');
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      return () => {
        // Remove highlight when component unmounts or step changes
        document.querySelectorAll('.onboarding-highlight').forEach(el => {
          el.classList.remove('onboarding-highlight');
        });
      };
    }
  }, [currentStep, isVisible, currentStepData]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 150);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!isVisible || !currentStepData) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
      
      {/* Onboarding Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className={`
          w-full max-w-md mx-auto shadow-2xl border-2 border-primary/20
          ${isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}
          transition-all duration-150
        `}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  Step {currentStep + 1} of {steps.length}
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSkip}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Getting started</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {currentStepData.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentStepData.description}
              </p>
            </div>

            {/* Action button if available */}
            {currentStepData.action && (
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <Button 
                  onClick={currentStepData.action.onClick}
                  className="w-full"
                  size="sm"
                >
                  <Target className="h-4 w-4 mr-2" />
                  {currentStepData.action.label}
                </Button>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-3 w-3" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSkip}
                  className="text-muted-foreground"
                >
                  Skip Tour
                </Button>
                
                <Button 
                  onClick={handleNext}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Finish
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-3 w-3" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CSS for highlighting */}
      <style jsx global>{`
        .onboarding-highlight {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2);
          border-radius: 8px;
          animation: pulse-highlight 2s infinite;
        }

        @keyframes pulse-highlight {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.7), 0 0 0 12px rgba(59, 130, 246, 0.3);
          }
        }
      `}</style>
    </>
  );
};

export default OnboardingTour;