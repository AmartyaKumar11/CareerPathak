import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  CheckCircle, 
  ArrowRight,
  DollarSign,
  Users,
  BookOpen
} from 'lucide-react';
import { useCareerPaths } from '@/services/dashboardService';
import { CareerPath } from '@/services/dashboardDatabase';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface CareerPathCardProps {
  careerPath: CareerPath;
  isSelected: boolean;
  onSelect: () => void;
}

const CareerPathCard = ({ careerPath, isSelected, onSelect }: CareerPathCardProps) => (
  <Card 
    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
      isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
    }`}
    onClick={onSelect}
  >
    <CardHeader className="pb-3">
      <CardTitle className="text-base font-semibold">{careerPath.title}</CardTitle>
      <Badge variant="outline" className="w-fit">
        {careerPath.stream}
      </Badge>
    </CardHeader>
    <CardContent>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{careerPath.steps.length} Career Phases</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <TrendingUp className="w-4 h-4" />
          <span>Growing {((careerPath.growthData[careerPath.growthData.length - 1]?.opportunities || 0) / (careerPath.growthData[0]?.opportunities || 1) * 100 - 100).toFixed(0)}% annually</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <DollarSign className="w-4 h-4" />
          <span>₹{(careerPath.growthData[careerPath.growthData.length - 1]?.avgSalary / 100000 || 0).toFixed(1)}L avg salary</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const CareerPathSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-20" />
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-24" />
      </div>
    </CardContent>
  </Card>
);

interface CareerTimelineProps {
  steps: CareerPath['steps'];
}

const CareerTimeline = ({ steps }: CareerTimelineProps) => (
  <div className="space-y-6">
    {steps.map((step, index) => (
      <div key={index} className="relative">
        {index < steps.length - 1 && (
          <div className="absolute left-4 top-8 w-0.5 h-16 bg-gradient-to-b from-blue-300 to-blue-100" />
        )}
        
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">{index + 1}</span>
            </div>
          </div>
          
          <div className="flex-1 pb-6">
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{step.phase}</h3>
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {step.duration}
                </Badge>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Target className="w-4 h-4 text-blue-500" />
                    Requirements
                  </h4>
                  <ul className="space-y-1">
                    {step.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600">
                        <ArrowRight className="w-3 h-3 mt-0.5 text-gray-400 flex-shrink-0" />
                        <span className="text-xs">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Outcomes
                  </h4>
                  <ul className="space-y-1">
                    {step.outcomes.map((outcome, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600">
                        <ArrowRight className="w-3 h-3 mt-0.5 text-gray-400 flex-shrink-0" />
                        <span className="text-xs">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

interface GrowthChartsProps {
  growthData: CareerPath['growthData'];
  title: string;
}

const GrowthCharts = ({ growthData, title }: GrowthChartsProps) => {
  const opportunityChartData = {
    labels: growthData.map(d => d.year.toString()),
    datasets: [
      {
        label: 'Job Opportunities',
        data: growthData.map(d => d.opportunities),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const salaryChartData = {
    labels: growthData.map(d => d.year.toString()),
    datasets: [
      {
        label: 'Average Salary (₹)',
        data: growthData.map(d => d.avgSalary),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(tickValue: string | number) {
            const value = Number(tickValue);
            if (value >= 100000) {
              return `${(value / 100000).toFixed(1)}L`;
            } else if (value >= 1000) {
              return `${(value / 1000).toFixed(1)}K`;
            }
            return value;
          }
        }
      }
    }
  };

  const salaryOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(tickValue: string | number) {
            const value = Number(tickValue);
            return `₹${(value / 100000).toFixed(1)}L`;
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          Job Market Growth
        </h3>
        <Line data={opportunityChartData} options={chartOptions} />
      </div>
      
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-500" />
          Salary Progression
        </h3>
        <Bar data={salaryChartData} options={salaryOptions} />
      </div>
    </div>
  );
};

export const CareerPathVisualizations = () => {
  const [selectedPathId, setSelectedPathId] = useState<string>('');
  const { data: careerPaths, isLoading, error, isError } = useCareerPaths();

  const selectedPath = careerPaths?.find(path => path.id === selectedPathId) || careerPaths?.[0];

  useEffect(() => {
    if (careerPaths && careerPaths.length > 0 && !selectedPathId) {
      setSelectedPathId(careerPaths[0].id);
    }
  }, [careerPaths, selectedPathId]);

  if (isError) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Career Path Visualizations</h2>
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            Unable to load career paths. {error instanceof Error ? error.message : 'Please try again later.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Career Path Visualizations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <CareerPathSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Career Path Visualizations</h2>
        <p className="text-sm text-gray-600 mt-1">
          Interactive career progression maps with growth projections
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {careerPaths?.map((path) => (
          <CareerPathCard
            key={path.id}
            careerPath={path}
            isSelected={selectedPathId === path.id}
            onSelect={() => setSelectedPathId(path.id)}
          />
        ))}
      </div>

      {selectedPath && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              {selectedPath.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="timeline">Career Timeline</TabsTrigger>
                <TabsTrigger value="growth">Growth Charts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="timeline" className="mt-6">
                <CareerTimeline steps={selectedPath.steps} />
              </TabsContent>
              
              <TabsContent value="growth" className="mt-6">
                <GrowthCharts 
                  growthData={selectedPath.growthData} 
                  title={selectedPath.title} 
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
