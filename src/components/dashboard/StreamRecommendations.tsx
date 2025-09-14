import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  GraduationCap, 
  DollarSign, 
  BarChart3, 
  Target,
  AlertTriangle,
  Star,
  ArrowRight
} from 'lucide-react';
import { 
  StreamRecommendation, 
  dashboardDB, 
  generateMockStreamRecommendations 
} from '@/services/dashboardDataService';
import { useProfileStore } from '@/stores/profileStore';

interface RecommendationCardProps {
  recommendation: StreamRecommendation;
  isCompact?: boolean;
}

const formatSalary = (amount: number): string => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${(amount / 1000).toFixed(0)}K`;
};

const RecommendationCard = ({ recommendation, isCompact = false }: RecommendationCardProps) => {
  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isCompact) {
    return (
      <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">
                {recommendation.streamName}
              </h3>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {recommendation.description}
              </p>
            </div>
            <div className="text-right ml-4">
              <Badge className={`${getMatchColor(recommendation.matchPercentage)} text-xs`}>
                {recommendation.matchPercentage}% Match
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
              {recommendation.streamName}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {recommendation.description}
            </p>
          </div>
          <Badge className={`${getMatchColor(recommendation.matchPercentage)} font-bold px-3 py-1`}>
            <Target className="w-3 h-3 mr-1" />
            {recommendation.matchPercentage}%
          </Badge>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Match Score</span>
            <span className="font-medium">{recommendation.matchPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(recommendation.matchPercentage)}`}
              style={{ width: `${recommendation.matchPercentage}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Salary Information */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-900">Salary Range</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Entry:</span>
            <span className="font-semibold text-green-600">
              {formatSalary(recommendation.averageSalary.entry)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Senior:</span>
            <span className="font-semibold text-green-600">
              {formatSalary(recommendation.averageSalary.senior)}
            </span>
          </div>
        </div>

        {/* Growth Rate and Difficulty */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">Growth:</span>
            <span className="text-sm font-semibold text-blue-600">
              +{recommendation.growthRate}%
            </span>
          </div>
          <Badge className={`${getDifficultyColor(recommendation.difficulty)} text-xs`}>
            {recommendation.difficulty}
          </Badge>
        </div>

        {/* Career Options */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-900">Top Careers</span>
          </div>
          <div className="space-y-1">
            {recommendation.careerOptions.slice(0, 3).map((career, index) => (
              <div key={index} className="text-sm text-gray-600 flex items-center">
                <Star className="h-3 w-3 mr-2 text-yellow-500" />
                {career}
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {recommendation.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Action Button */}
        <Button className="w-full mt-4" variant="outline" size="sm">
          Learn More
          <ArrowRight className="h-3 w-3 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);

export const StreamRecommendations = ({ limit = 5, compact = false }: { limit?: number; compact?: boolean }) => {
  const [recommendations, setRecommendations] = useState<StreamRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentProfile } = useProfileStore();

  useEffect(() => {
    loadRecommendations();
  }, [currentProfile, limit]);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to get cached recommendations first
      let cachedRecommendations = await dashboardDB.getStreamRecommendations();
      
      // If no cached data or cache is old, generate new ones
      if (cachedRecommendations.length === 0) {
        const mockRecommendations = generateMockStreamRecommendations(currentProfile);
        await dashboardDB.saveStreamRecommendations(mockRecommendations);
        await dashboardDB.setCacheTimestamp('recommendations', Date.now());
        cachedRecommendations = mockRecommendations;
      }

      // Sort by match percentage and limit results
      const sortedRecommendations = cachedRecommendations
        .sort((a, b) => b.matchPercentage - a.matchPercentage)
        .slice(0, limit);

      setRecommendations(sortedRecommendations);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('Failed to load stream recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error}. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <TrendingUp className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Complete your profile to get personalized stream recommendations.
        </AlertDescription>
      </Alert>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {recommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            isCompact={true}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Recommended Streams
          </h3>
          <p className="text-sm text-gray-600">
            Based on your profile and interests
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Target className="h-3 w-3" />
          {recommendations.length} matches
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
          />
        ))}
      </div>
    </div>
  );
};
