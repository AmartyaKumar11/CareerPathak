// Custom subject types
interface CustomSubject {
  name: string;
  stream: 'science' | 'commerce' | 'arts';
}

// Utility to load/save custom subjects from localStorage (or backend if needed)
const getSavedCustomSubjects = () => {
  try {
    const raw = localStorage.getItem('customSubjects');
    return raw ? JSON.parse(raw) : { science: [], commerce: [], arts: [] };
  } catch {
    return { science: [], commerce: [], arts: [] };
  }
};

const saveCustomSubjects = (subjects) => {
  localStorage.setItem('customSubjects', JSON.stringify(subjects));
};
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, FileText, Brain, Award, TrendingUp, Users, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:3001/api';

interface SubjectMarks {
  physics?: number;
  chemistry?: number;
  mathematics?: number;
  biology?: number;
  english?: number;
  economics?: number;
  accountancy?: number;
  businessStudies?: number;
  geography?: number;
  history?: number;
  politicalScience?: number;
  sociology?: number;
}

interface ParsedMarks {
  subjects: {
    name: string;
    marks: number;
    maxMarks: number;
    grade?: string;
    confidence: number;
  }[];
  totalMarks?: number;
  totalMaxMarks?: number;
  percentage?: number;
  confidence: number;
}

interface ProcessedFile {
  name: string;
  size: number;
  ocrSuccess: boolean;
  parsedMarks?: ParsedMarks;
  confidenceScore: number;
  requiresManualEntry: boolean;
}

interface PsychometricAnswer {
  questionId: string;
  answer: string;
  questionText: string;
}

interface StreamRecommendation {
  id: string;
  name: string;
  category: string;
  fitScore: number;
  eligibilityMet: boolean;
  eligibilityCriteria: any;
  entranceExams: string[];
  careers: string[];
  personalityTraits: string[];
  topColleges: string[];
  salaryRange: string;
  reasoning: string;
}

interface AIGeneratedQuestion {
  id: string;
  question: string;
  options: string[];
  context?: string;
  followUpTraits: string[];
}

export default function StreamRecommendations() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'marks' | 'test' | 'results'>('upload');
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [subjectMarks, setSubjectMarks] = useState<SubjectMarks>({});
  const [autoExtractedMarks, setAutoExtractedMarks] = useState<SubjectMarks>({});
  const [showManualEntry, setShowManualEntry] = useState(true);
  const [psychometricAnswers, setPsychometricAnswers] = useState<PsychometricAnswer[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [aiQuestions, setAiQuestions] = useState<AIGeneratedQuestion[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(15);
  const [recommendations, setRecommendations] = useState<StreamRecommendation[]>([]);
  const { toast } = useToast();

  // Custom subjects state
  const [customSubjects, setCustomSubjects] = useState(getSavedCustomSubjects());
  const [newCustomSubject, setNewCustomSubject] = useState({ science: '', commerce: '', arts: '' });

  // Persist custom subjects on change
  useEffect(() => {
    saveCustomSubjects(customSubjects);
  }, [customSubjects]);

  // Add custom subject handler
  const handleAddCustomSubject = (stream: 'science' | 'commerce' | 'arts') => {
    const name = newCustomSubject[stream].trim();
    if (!name) return;
    if (customSubjects[stream].some((s: CustomSubject) => s.name.toLowerCase() === name.toLowerCase())) return;
    setCustomSubjects(prev => ({
      ...prev,
      [stream]: [...prev[stream], { name, stream }]
    }));
    setNewCustomSubject(prev => ({ ...prev, [stream]: '' }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setLoading(true);
    const formData = new FormData();
    
    Array.from(files).forEach((file) => {
      formData.append('marksheets', file);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/streams/upload-marksheets`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setUploadedFiles(prev => [...prev, ...Array.from(files)]);
        setProcessedFiles(data.files);
        
        // Extract auto-parsed marks and merge them
        const extractedMarks: SubjectMarks = {};
        data.files.forEach((file: ProcessedFile) => {
          if (file.parsedMarks && file.confidenceScore > 0.7) {
            file.parsedMarks.subjects.forEach(subject => {
              const subjectKey = normalizeSubjectName(subject.name);
              if (subjectKey && subject.confidence > 0.7) {
                extractedMarks[subjectKey] = subject.marks;
              }
            });
          }
        });

        setAutoExtractedMarks(extractedMarks);
        setSubjectMarks(prev => ({ ...extractedMarks, ...prev }));
        
        // Check if we can skip manual entry
        const highConfidenceFiles = data.files.filter((f: ProcessedFile) => !f.requiresManualEntry);
        const shouldShowManual = data.files.some((f: ProcessedFile) => f.requiresManualEntry);
        setShowManualEntry(shouldShowManual);

        toast({
          title: 'Files Processed!',
          description: `${data.files.length} marksheet(s) uploaded. ${data.autoExtractedCount} automatically parsed. ${shouldShowManual ? 'Please verify the extracted marks.' : 'All marks extracted successfully!'}`,
        });

        // If all files were processed successfully, offer to skip to psychometric test
        if (!shouldShowManual && Object.keys(extractedMarks).length > 0) {
          toast({
            title: 'Ready to Continue!',
            description: 'All marks have been automatically extracted. You can proceed directly to the psychometric test.',
          });
        }
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to process marksheets. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to normalize subject names from OCR
  const normalizeSubjectName = (name: string): keyof SubjectMarks | null => {
    const normalized = name.toLowerCase().replace(/[^a-z]/g, '');
    
    const subjectMap: Record<string, keyof SubjectMarks> = {
      'physics': 'physics',
      'chemistry': 'chemistry',
      'mathematics': 'mathematics',
      'math': 'mathematics',
      'maths': 'mathematics',
      'biology': 'biology',
      'english': 'english',
      'economics': 'economics',
      'accountancy': 'accountancy',
      'accounting': 'accountancy',
      'businessstudies': 'businessStudies',
      'business': 'businessStudies',
      'geography': 'geography',
      'history': 'history',
      'politicalscience': 'politicalScience',
      'political': 'politicalScience',
      'sociology': 'sociology'
    };

    return subjectMap[normalized] || null;
  };

  const removeUploadedFile = (indexToRemove: number) => {
    setUploadedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    toast({
      title: 'File Removed',
      description: 'Marksheet removed from upload list.'
    });
  };

  const handleMarksSubmit = async () => {
      setLoading(true);
      try {
        // Use subjectMarks if present, else fallback to autoExtractedMarks
        const marksToSubmit = Object.keys(subjectMarks).length > 0 ? subjectMarks : autoExtractedMarks;
        if (Object.keys(marksToSubmit).length === 0) {
          toast({
            title: 'No Marks Found',
            description: 'Please enter or verify your marks before continuing.',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }
        // Submit marks to backend
        const response = await fetch(`${API_BASE_URL}/streams/marks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ marks: marksToSubmit })
        });

        if (response.ok) {
          // Generate initial AI question based on marks
          await generateNextQuestion();
          setCurrentStep('test');
          toast({
            title: 'Marks Saved',
            description: 'Your marks have been recorded. Now let\'s assess your interests!'
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to save marks. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

  const generateNextQuestion = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/streams/generate-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          previousAnswers: psychometricAnswers,
          subjectMarks: subjectMarks,
          questionNumber: currentQuestion + 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newQuestion: AIGeneratedQuestion = {
          id: data.questionId,
          question: data.question,
          options: data.options,
          context: data.context,
          followUpTraits: data.followUpTraits || []
        };
        
        setAiQuestions(prev => [...prev, newQuestion]);
        setTotalQuestions(data.totalQuestions || 15);
      }
    } catch (error) {
      console.error('Failed to generate question:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate next question. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handlePsychometricAnswer = (questionId: string, answer: string) => {
    const currentAIQuestion = aiQuestions[currentQuestion];
    setPsychometricAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== questionId);
      return [...filtered, { 
        questionId, 
        answer, 
        questionText: currentAIQuestion?.question || '' 
      }];
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < aiQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleTestComplete();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleTestComplete = async () => {
    setLoading(true);
    try {
      // Submit psychometric test results
      await fetch(`${API_BASE_URL}/streams/psychometric`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: psychometricAnswers })
      });

      // Get recommendations
      const response = await fetch(`${API_BASE_URL}/streams/recommendations`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
        setCurrentStep('results');
        toast({
          title: 'Analysis Complete',
          description: 'Your personalized stream recommendations are ready!'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete analysis. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 'upload': return 25;
      case 'marks': return 50;
      case 'test': return 75;
      case 'results': return 100;
      default: return 0;
    }
  };

  const getCurrentAnswer = (questionId: string) => {
    return psychometricAnswers.find(a => a.questionId === questionId)?.answer || '';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stream Recommendations</h1>
        <p className="text-gray-600 mb-4">
          Upload your marksheet, take our psychometric test, and discover the perfect academic stream for you.
        </p>
        <Progress value={getStepProgress()} className="w-full" />
      </div>

      {currentStep === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Your Marksheet
            </CardTitle>
            <CardDescription>
              Upload your 12th grade marksheet (PDF or image) or skip to enter marks manually.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Drop your marksheets here or click to browse</p>
                <p className="text-sm text-gray-500">Supports PDF, JPG, PNG files up to 10MB each</p>
                <p className="text-xs text-gray-400">You can upload multiple marksheets (regular, supplementary, different boards)</p>
              </div>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                multiple
                className="mt-4 w-full max-w-xs mx-auto"
              />
              
              {/* Display uploaded files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6 space-y-2">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Uploaded Marksheets ({uploadedFiles.length})
                  </p>
                  <div className="grid gap-2 max-w-md mx-auto">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-bold text-green-700 truncate max-w-48">
                            {file.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUploadedFile(index)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setCurrentStep('marks')} className="px-8">
                Continue to Enter Marks
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'marks' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {Object.keys(autoExtractedMarks).length > 0 ? 'Verify Your Extracted Marks' : 'Enter Your Subject Marks'}
            </CardTitle>
            <CardDescription>
              {Object.keys(autoExtractedMarks).length > 0 ? 
                'We\'ve automatically extracted marks from your marksheets. Please verify and edit if needed.' :
                'Enter your 12th grade marks for each subject. Leave blank if not applicable.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(autoExtractedMarks).length > 0 && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Auto-extracted from {processedFiles.length} marksheet(s)
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  {Object.entries(autoExtractedMarks).map(([subject, marks]) => (
                    <div key={subject} className="flex justify-between">
                      <span className="font-medium capitalize">{subject.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span>{marks}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showManualEntry && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {Object.keys(autoExtractedMarks).length > 0 ? 'Edit Extracted Marks' : 'Enter Marks Manually'}
                  </h3>
                  {Object.keys(autoExtractedMarks).length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSubjectMarks({});
                        toast({ title: 'Marks cleared', description: 'You can now enter marks manually.' });
                      }}
                    >
                      Clear All & Start Fresh
                    </Button>
                  )}
                </div>

                <Tabs defaultValue="science" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="science">Science</TabsTrigger>
                    <TabsTrigger value="commerce">Commerce</TabsTrigger>
                    <TabsTrigger value="arts">Arts/Humanities</TabsTrigger>
                  </TabsList>

                  <TabsContent value="science" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Custom Subject Entry for Science */}
                      {customSubjects.science.map((subject: CustomSubject, idx: number) => (
                        <div key={subject.name + idx}>
                          <Label htmlFor={subject.name} className="flex items-center gap-2">
                            {subject.name}
                            <Badge variant="outline" className="text-xs">Custom</Badge>
                          </Label>
                          <Input
                            id={subject.name}
                            type="number"
                            placeholder="Enter marks (0-100)"
                            value={subjectMarks[subject.name] || ''}
                            onChange={(e) => setSubjectMarks(prev => ({ ...prev, [subject.name]: Number(e.target.value) }))}
                          />
                        </div>
                      ))}
                      <div className="col-span-2 flex gap-2 items-center mt-2">
                        <Input
                          type="text"
                          placeholder="Add custom subject"
                          value={newCustomSubject.science}
                          onChange={e => setNewCustomSubject(prev => ({ ...prev, science: e.target.value }))}
                        />
                        <Button size="sm" variant="secondary" onClick={() => handleAddCustomSubject('science')}>
                          Add Subject
                        </Button>
                      </div>
                      <div>
                        <Label htmlFor="physics" className="flex items-center gap-2">
                          Physics
                          {autoExtractedMarks.physics && <Badge variant="outline" className="text-xs">Auto-filled</Badge>}
                        </Label>
                        <Input
                          id="physics"
                          type="number"
                          placeholder="Enter marks (0-100)"
                          value={subjectMarks.physics || ''}
                          onChange={(e) => setSubjectMarks(prev => ({ ...prev, physics: Number(e.target.value) }))}
                          className={autoExtractedMarks.physics ? 'border-green-300 bg-green-50' : ''}
                        />
                      </div>
                      <div>
                        <Label htmlFor="chemistry" className="flex items-center gap-2">
                          Chemistry
                          {autoExtractedMarks.chemistry && <Badge variant="outline" className="text-xs">Auto-filled</Badge>}
                        </Label>
                        <Input
                          id="chemistry"
                          type="number"
                          placeholder="Enter marks (0-100)"
                          value={subjectMarks.chemistry || ''}
                          onChange={(e) => setSubjectMarks(prev => ({ ...prev, chemistry: Number(e.target.value) }))}
                          className={autoExtractedMarks.chemistry ? 'border-green-300 bg-green-50' : ''}
                        />
                      </div>
                      <div>
                        <Label htmlFor="mathematics" className="flex items-center gap-2">
                          Mathematics
                          {autoExtractedMarks.mathematics && <Badge variant="outline" className="text-xs">Auto-filled</Badge>}
                        </Label>
                        <Input
                          id="mathematics"
                          type="number"
                          placeholder="Enter marks (0-100)"
                          value={subjectMarks.mathematics || ''}
                          onChange={(e) => setSubjectMarks(prev => ({ ...prev, mathematics: Number(e.target.value) }))}
                          className={autoExtractedMarks.mathematics ? 'border-green-300 bg-green-50' : ''}
                        />
                      </div>
                      <div>
                        <Label htmlFor="biology" className="flex items-center gap-2">
                          Biology
                          {autoExtractedMarks.biology && <Badge variant="outline" className="text-xs">Auto-filled</Badge>}
                        </Label>
                        <Input
                          id="biology"
                          type="number"
                          placeholder="Enter marks (0-100)"
                          value={subjectMarks.biology || ''}
                          onChange={(e) => setSubjectMarks(prev => ({ ...prev, biology: Number(e.target.value) }))}
                          className={autoExtractedMarks.biology ? 'border-green-300 bg-green-50' : ''}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="commerce" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Custom Subject Entry for Commerce */}
                      {customSubjects.commerce.map((subject: CustomSubject, idx: number) => (
                        <div key={subject.name + idx}>
                          <Label htmlFor={subject.name} className="flex items-center gap-2">
                            {subject.name}
                            <Badge variant="outline" className="text-xs">Custom</Badge>
                          </Label>
                          <Input
                            id={subject.name}
                            type="number"
                            placeholder="Enter marks (0-100)"
                            value={subjectMarks[subject.name] || ''}
                            onChange={(e) => setSubjectMarks(prev => ({ ...prev, [subject.name]: Number(e.target.value) }))}
                          />
                        </div>
                      ))}
                      <div className="col-span-2 flex gap-2 items-center mt-2">
                        <Input
                          type="text"
                          placeholder="Add custom subject"
                          value={newCustomSubject.commerce}
                          onChange={e => setNewCustomSubject(prev => ({ ...prev, commerce: e.target.value }))}
                        />
                        <Button size="sm" variant="secondary" onClick={() => handleAddCustomSubject('commerce')}>
                          Add Subject
                        </Button>
                      </div>
                      <div>
                        <Label htmlFor="accountancy" className="flex items-center gap-2">
                          Accountancy
                          {autoExtractedMarks.accountancy && <Badge variant="outline" className="text-xs">Auto-filled</Badge>}
                        </Label>
                        <Input
                          id="accountancy"
                          type="number"
                          placeholder="Enter marks (0-100)"
                          value={subjectMarks.accountancy || ''}
                          onChange={(e) => setSubjectMarks(prev => ({ ...prev, accountancy: Number(e.target.value) }))}
                          className={autoExtractedMarks.accountancy ? 'border-green-300 bg-green-50' : ''}
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessStudies" className="flex items-center gap-2">
                          Business Studies
                          {autoExtractedMarks.businessStudies && <Badge variant="outline" className="text-xs">Auto-filled</Badge>}
                        </Label>
                        <Input
                          id="businessStudies"
                          type="number"
                          placeholder="Enter marks (0-100)"
                          value={subjectMarks.businessStudies || ''}
                          onChange={(e) => setSubjectMarks(prev => ({ ...prev, businessStudies: Number(e.target.value) }))}
                          className={autoExtractedMarks.businessStudies ? 'border-green-300 bg-green-50' : ''}
                        />
                      </div>
                      <div>
                        <Label htmlFor="economics" className="flex items-center gap-2">
                          Economics
                          {autoExtractedMarks.economics && <Badge variant="outline" className="text-xs">Auto-filled</Badge>}
                        </Label>
                        <Input
                          id="economics"
                          type="number"
                          placeholder="Enter marks (0-100)"
                          value={subjectMarks.economics || ''}
                          onChange={(e) => setSubjectMarks(prev => ({ ...prev, economics: Number(e.target.value) }))}
                          className={autoExtractedMarks.economics ? 'border-green-300 bg-green-50' : ''}
                        />
                      </div>
                      <div>
                        <Label htmlFor="english" className="flex items-center gap-2">
                          English
                          {autoExtractedMarks.english && <Badge variant="outline" className="text-xs">Auto-filled</Badge>}
                        </Label>
                        <Input
                          id="english"
                          type="number"
                          placeholder="Enter marks (0-100)"
                          value={subjectMarks.english || ''}
                          onChange={(e) => setSubjectMarks(prev => ({ ...prev, english: Number(e.target.value) }))}
                          className={autoExtractedMarks.english ? 'border-green-300 bg-green-50' : ''}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="arts" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Custom Subject Entry for Arts */}
                      {customSubjects.arts.map((subject: CustomSubject, idx: number) => (
                        <div key={subject.name + idx}>
                          <Label htmlFor={subject.name} className="flex items-center gap-2">
                            {subject.name}
                            <Badge variant="outline" className="text-xs">Custom</Badge>
                          </Label>
                          <Input
                            id={subject.name}
                            type="number"
                            placeholder="Enter marks (0-100)"
                            value={subjectMarks[subject.name] || ''}
                            onChange={(e) => setSubjectMarks(prev => ({ ...prev, [subject.name]: Number(e.target.value) }))}
                          />
                        </div>
                      ))}
                      <div className="col-span-2 flex gap-2 items-center mt-2">
                        <Input
                          type="text"
                          placeholder="Add custom subject"
                          value={newCustomSubject.arts}
                          onChange={e => setNewCustomSubject(prev => ({ ...prev, arts: e.target.value }))}
                        />
                        <Button size="sm" variant="secondary" onClick={() => handleAddCustomSubject('arts')}>
                          Add Subject
                        </Button>
                      </div>
                      <div>
                        <Label htmlFor="history" className="flex items-center gap-2">
                          History
                          {autoExtractedMarks.history && <Badge variant="outline" className="text-xs">Auto-filled</Badge>}
                        </Label>
                        <Input
                          id="history"
                          type="number"
                          placeholder="Enter marks (0-100)"
                          value={subjectMarks.history || ''}
                          onChange={(e) => setSubjectMarks(prev => ({ ...prev, history: Number(e.target.value) }))}
                          className={autoExtractedMarks.history ? 'border-green-300 bg-green-50' : ''}
                        />
                      </div>
                      <div>
                        <Label htmlFor="geography" className="flex items-center gap-2">
                          Geography
                          {autoExtractedMarks.geography && <Badge variant="outline" className="text-xs">Auto-filled</Badge>}
                        </Label>
                        <Input
                          id="geography"
                          type="number"
                          placeholder="Enter marks (0-100)"
                          value={subjectMarks.geography || ''}
                          onChange={(e) => setSubjectMarks(prev => ({ ...prev, geography: Number(e.target.value) }))}
                          className={autoExtractedMarks.geography ? 'border-green-300 bg-green-50' : ''}
                        />
                      </div>
                      <div>
                        <Label htmlFor="politicalScience" className="flex items-center gap-2">
                          Political Science
                          {autoExtractedMarks.politicalScience && <Badge variant="outline" className="text-xs">Auto-filled</Badge>}
                        </Label>
                        <Input
                          id="politicalScience"
                          type="number"
                          placeholder="Enter marks (0-100)"
                          value={subjectMarks.politicalScience || ''}
                          onChange={(e) => setSubjectMarks(prev => ({ ...prev, politicalScience: Number(e.target.value) }))}
                          className={autoExtractedMarks.politicalScience ? 'border-green-300 bg-green-50' : ''}
                        />
                      </div>
                      <div>
                        <Label htmlFor="sociology" className="flex items-center gap-2">
                          Sociology
                          {autoExtractedMarks.sociology && <Badge variant="outline" className="text-xs">Auto-filled</Badge>}
                        </Label>
                        <Input
                          id="sociology"
                          type="number"
                          placeholder="Enter marks (0-100)"
                          value={subjectMarks.sociology || ''}
                          onChange={(e) => setSubjectMarks(prev => ({ ...prev, sociology: Number(e.target.value) }))}
                          className={autoExtractedMarks.sociology ? 'border-green-300 bg-green-50' : ''}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {!showManualEntry && Object.keys(autoExtractedMarks).length > 0 && (
              <div className="text-center p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    All marks automatically extracted!
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  We successfully extracted all your marks from the uploaded marksheets with high confidence.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowManualEntry(true)}
                >
                  Edit Marks Anyway
                </Button>
              </div>
            )}

            <div className="flex gap-4 justify-center mt-6">
              <Button variant="outline" onClick={() => setCurrentStep('upload')}>
                Back
              </Button>
              <Button onClick={handleMarksSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Marks...
                  </>
                ) : (
                  'Continue to Psychometric Test'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'test' && aiQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI-Powered Psychometric Assessment
            </CardTitle>
            <CardDescription>
              Question {currentQuestion + 1} of {totalQuestions} - Personalized for your academic profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Progress value={(currentQuestion + 1) / totalQuestions * 100} className="w-full mb-2" />
                <p className="text-sm text-gray-500">
                  {currentQuestion + 1} of {totalQuestions} questions
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium mb-2">
                  {aiQuestions[currentQuestion]?.question || 'Loading question...'}
                </h3>
                {aiQuestions[currentQuestion]?.context && (
                  <p className="text-sm text-gray-600 mb-4 italic">
                    {aiQuestions[currentQuestion].context}
                  </p>
                )}
                
                <RadioGroup
                  value={getCurrentAnswer(aiQuestions[currentQuestion]?.id || '')}
                  onValueChange={(value) => handlePsychometricAnswer(aiQuestions[currentQuestion]?.id || '', value)}
                >
                  {(aiQuestions[currentQuestion]?.options || []).map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              
              <Button
                onClick={handleNextQuestion}
                disabled={!getCurrentAnswer(aiQuestions[currentQuestion]?.id || '') || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : currentQuestion === totalQuestions - 1 ? (
                  'Complete Assessment'
                ) : (
                  'Next Question'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'test' && aiQuestions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Generating Your Personalized Questions</h3>
            <p className="text-gray-600">
              Our AI is analyzing your academic profile to create tailored psychometric questions...
            </p>
          </CardContent>
        </Card>
      )}

      {currentStep === 'results' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Your Stream Recommendations
              </CardTitle>
              <CardDescription>
                Based on your marks and psychometric assessment, here are your personalized stream recommendations.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {recommendations.map((stream, index) => (
              <StreamRecommendationCard key={stream.id} stream={stream} rank={index + 1} />
            ))}
          </div>

          {recommendations.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Analyzing Your Profile</h3>
                <p className="text-gray-600 mb-4">
                  We're processing your marks and psychometric results to find the best streams for you.
                </p>
                <Button onClick={() => window.location.reload()}>
                  Refresh Results
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function StreamRecommendationCard({ stream, rank }: { stream: StreamRecommendation; rank: number }) {
  const getFitColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="font-bold">
              #{rank}
            </Badge>
            <Badge variant="secondary" className="capitalize">
              {stream.category}
            </Badge>
            {stream.eligibilityMet && (
              <Badge variant="default" className="bg-green-500">
                Eligible
              </Badge>
            )}
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-white text-sm font-medium ${getFitColor(stream.fitScore)}`}>
              {Math.round(stream.fitScore)}% Fit
            </div>
          </div>
        </div>
        
        <CardTitle className="text-xl">{stream.name}</CardTitle>
        <CardDescription className="text-sm">{stream.reasoning}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {stream.entranceExams.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2">Entrance Exams:</h4>
            <div className="flex flex-wrap gap-1">
              {stream.entranceExams.map((exam, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {exam}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {stream.careers.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Career Opportunities:
            </h4>
            <div className="flex flex-wrap gap-1">
              {stream.careers.slice(0, 4).map((career, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {career}
                </Badge>
              ))}
              {stream.careers.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{stream.careers.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {stream.topColleges.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              Top Colleges:
            </h4>
            <div className="text-sm text-gray-600">
              {stream.topColleges.slice(0, 3).join(', ')}
              {stream.topColleges.length > 3 && ` and ${stream.topColleges.length - 3} more`}
            </div>
          </div>
        )}

        <div className="flex justify-between text-sm pt-2 border-t">
          <span className="text-gray-500">Expected Salary:</span>
          <span className="font-medium">{stream.salaryRange}</span>
        </div>
      </CardContent>
    </Card>
  );
}