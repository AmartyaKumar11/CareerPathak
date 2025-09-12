import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, GraduationCap, DollarSign, Users } from 'lucide-react';
import { useTopRecommendations } from '@/services/dashboardService';

interface RecommendationCardProps {
  recommendation: {
    id: string;
    streamName: string;
    matchPercentage: number;
    description: string;
    careerOptions: string[];
    avgSalary: string;
  };
}

const RecommendationCard = ({ recommendation }: RecommendationCardProps) => {
  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 75) return 'text-blue-600 bg-blue-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
              {recommendation.streamName}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`px-2 py-1 text-sm font-medium ${getMatchColor(recommendation.matchPercentage)}`}>
                <TrendingUp className="w-3 h-3 mr-1" />
                {recommendation.matchPercentage}% Match
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Match Score</span>
            <span className="font-medium">{recommendation.matchPercentage}%</span>
          </div>
          <Progress 
            value={recommendation.matchPercentage} 
            className="h-2"
            style={{ 
              '--progress-background': getProgressColor(recommendation.matchPercentage) 
            } as React.CSSProperties}
          />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {recommendation.description}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-700">{recommendation.avgSalary}</span>
          </div>
          
          <div className="flex items-start gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Top Career Options:</p>
              <div className="flex flex-wrap gap-1">
                {recommendation.careerOptions.slice(0, 3).map((career, index) => (
                  <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                    {career}
                  </Badge>
                ))}
                {recommendation.careerOptions.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5 text-gray-500">
                    +{recommendation.careerOptions.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RecommendationSkeleton = () => (
  <Card className="h-full">
    <CardHeader>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-start gap-2">
          <Skeleton className="h-4 w-4" />
          <div className="flex-1">
            <Skeleton className="h-3 w-24 mb-1" />
            <div className="flex gap-1">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-18" />
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const StreamRecommendations = () => {
  const { data: recommendations, isLoading, error, isError } = useTopRecommendations(4);

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Stream Recommendations</h2>
        </div>
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            Unable to load recommendations. {error instanceof Error ? error.message : 'Please try again later.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Stream Recommendations</h2>
          <p className="text-sm text-gray-600 mt-1">
            Personalized recommendations based on your profile and interests
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>AI Powered</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }, (_, i) => (
            <RecommendationSkeleton key={i} />
          ))
        ) : (
          recommendations?.map((recommendation) => (
            <RecommendationCard 
              key={recommendation.id} 
              recommendation={recommendation} 
            />
          ))
        )}
      </div>
      
      {!isLoading && recommendations && recommendations.length === 0 && (
        <Alert>
          <AlertDescription>
            Complete your profile to get personalized stream recommendations.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
