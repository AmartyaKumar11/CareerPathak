import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Target, 
  Map, 
  BarChart3, 
  Users, 
  Clock,
  CheckCircle,
  ArrowRight,
  Info
} from 'lucide-react';

interface ActionItem {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  route: string;
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
  estimatedTime?: string;
  tooltip?: string;
}

const ImprovedQuickActions = () => {
  const navigate = useNavigate();
  const [completedActions, setCompletedActions] = useState<string[]>([]);

  const actions: ActionItem[] = [
    { 
      id: 'quiz',
      icon: Target, 
      label: 'Take Aptitude Quiz', 
      description: 'Discover your strengths',
      color: 'bg-blue-500',
      route: '/quiz',
      priority: 'high',
      estimatedTime: '15 min',
      tooltip: 'Complete this first to get personalized recommendations'
    },
    { 
      id: 'colleges',
      icon: Map, 
      label: 'Explore Colleges', 
      description: 'Find nearby options',
      color: 'bg-green-500',
      route: '/nearby-colleges-map',
      priority: 'medium',
      estimatedTime: '10 min',
      tooltip: 'Browse colleges within 50km of your location'
    },
    { 
      id: 'careers',
      icon: BarChart3, 
      label: 'Career Insights', 
      description: 'Explore job markets',
      color: 'bg-purple-500',
      route: '/careers',
      priority: 'medium',
      estimatedTime: '20 min',
      tooltip: 'Learn about salary trends and job opportunities'
    },
    { 
      id: 'network',
      icon: Users, 
      label: 'Alumni Connect', 
      description: 'Get mentorship',
      color: 'bg-orange-500',
      route: '/network',
      priority: 'low',
      estimatedTime: '5 min',
      tooltip: 'Connect with successful alumni from your region'
    },
  ];

  // Sort actions by priority and completion status
  const sortedActions = actions.sort((a, b) => {
    if (completedActions.includes(a.id) && !completedActions.includes(b.id)) return 1;
    if (!completedActions.includes(a.id) && completedActions.includes(b.id)) return -1;
    
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const completionPercentage = (completedActions.length / actions.length) * 100;

  const handleActionClick = (action: ActionItem) => {
    if (!completedActions.includes(action.id)) {
      setCompletedActions(prev => [...prev, action.id]);
    }
    navigate(action.route);
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return styles[priority as keyof typeof styles];
  };

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Your Next Steps
            </CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Complete these actions to get the most out of CareerPathak</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(completionPercentage)}% Complete</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {sortedActions.map((action) => {
            const isCompleted = completedActions.includes(action.id);
            
            return (
              <Tooltip key={action.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className={`
                      w-full h-auto p-4 flex items-center justify-between
                      ${isCompleted ? 'bg-green-50 border-green-200' : 'hover:shadow-md'}
                      ${action.priority === 'high' && !isCompleted ? 'ring-2 ring-blue-200 border-blue-300' : ''}
                      transition-all duration-200
                    `}
                    onClick={() => handleActionClick(action)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        p-2 rounded-lg text-white flex-shrink-0
                        ${isCompleted ? 'bg-green-500' : action.color}
                      `}>
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <action.icon className="h-4 w-4" />
                        )}
                      </div>
                      
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {action.label}
                          </span>
                          {action.priority === 'high' && !isCompleted && (
                            <Badge variant="secondary" className={getPriorityBadge(action.priority)}>
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {action.description}
                          {action.estimatedTime && ` • ${action.estimatedTime}`}
                        </p>
                      </div>
                    </div>
                    
                    {!isCompleted && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </Button>
                </TooltipTrigger>
                
                {action.tooltip && (
                  <TooltipContent side="left" className="max-w-xs">
                    <p>{action.tooltip}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}

          {/* Completion celebration */}
          {completionPercentage === 100 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-sm font-medium text-green-800">
                Great job! You've completed all recommended actions.
              </p>
              <p className="text-xs text-green-600 mt-1">
                Keep exploring to discover more opportunities!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default ImprovedQuickActions;